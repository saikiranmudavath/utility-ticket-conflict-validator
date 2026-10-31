import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_POOL } from '../database/database.module';

@Injectable()
export class TicketsService {
  constructor(@Inject(DATABASE_POOL) private db: Pool) {}

  async getConflicts(q: any) {
    const b = String(q.bbox || '').split(',').map(Number);
    const r = Number(q.radiusMeters || 250);

    if (b.length !== 4 || !b.every(Number.isFinite) ||
        b[0] >= b[2] || b[1] >= b[3] ||
        b[0] < -180 || b[2] > 180 ||
        b[1] < -90 || b[3] > 90 || r <= 0) {
      throw new BadRequestException('Invalid bbox or radius');
    }

    const { rows } = await this.db.query(`
      SELECT t.id, t.ticket_no AS "ticketNo",
        t.status, t.priority, sc.code AS "stationCode",
        sc.utility_type AS "utilityType",
        ST_X(t.geom) AS longitude, ST_Y(t.geom) AS latitude,

        EXISTS (
          SELECT 1 FROM service_areas sa
          WHERE sa.station_code_id = t.station_code_id
          AND ST_Covers(sa.geom, t.geom)
        ) AS "insideServiceArea",

        e.ticket_no AS "nearestEmergencyTicketNo",
        ROUND(e.distance::numeric, 2) AS "distanceToNearestEmergencyMeters",

        CASE
          WHEN t.priority = 'EMERGENCY' OR e.ticket_no IS NOT NULL
            THEN 'HIGH'
          WHEN NOT EXISTS (
            SELECT 1 FROM service_areas sa
            WHERE sa.station_code_id = t.station_code_id
            AND ST_Covers(sa.geom, t.geom)
          ) OR (t.status = 'PRE_COMPLETED' AND t.due_at < NOW())
            THEN 'MEDIUM'
          ELSE 'LOW'
        END AS "riskLevel"

      FROM tickets t
      JOIN station_codes sc ON sc.id = t.station_code_id

      LEFT JOIN LATERAL (
        SELECT x.ticket_no,
          ST_Distance(t.geom::geography, x.geom::geography) AS distance
        FROM tickets x
        WHERE x.id <> t.id AND x.priority = 'EMERGENCY'
          AND ST_DWithin(t.geom::geography, x.geom::geography, $5)
        ORDER BY distance LIMIT 1
      ) e ON TRUE

      WHERE ST_Intersects(t.geom, ST_MakeEnvelope($1,$2,$3,$4,4326))
        AND ($6::text IS NULL OR sc.code = $6)
        AND ($7::text IS NULL OR sc.utility_type = $7)
      ORDER BY t.id
    `, [b[0], b[1], b[2], b[3], r,
        q.stationCode || null, q.utilityType || null]);

    const summary = {
      total: rows.length,
      highRisk: rows.filter(x => x.riskLevel === 'HIGH').length,
      mediumRisk: rows.filter(x => x.riskLevel === 'MEDIUM').length,
      lowRisk: rows.filter(x => x.riskLevel === 'LOW').length,
      outsideServiceArea: rows.filter(x => !x.insideServiceArea).length,
      byUtilityType: {} as Record<string, number>
    };

    rows.forEach(x => {
      summary.byUtilityType[x.utilityType] =
        (summary.byUtilityType[x.utilityType] || 0) + 1;
    });

    return { summary, tickets: rows };
  }
}