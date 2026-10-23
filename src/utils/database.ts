import { ApprovalCard, DocumentRecord, OrderRecord, AutomationRunLog } from '../types/enterprise';

export interface DatabaseStats {
  totalOrders: number;
  totalRevenueVnd: number;
  pendingApprovals: number;
  approvedOrders: number;
  totalDocuments: number;
  totalAutomationsRun: number;
}

export class EnterpriseDatabase {
  private db: any = null;
  private isSqlite: boolean = false;
  private memoryOrders: Map<string, OrderRecord> = new Map();
  private memoryDocs: Map<string, DocumentRecord> = new Map();
  private memoryApprovals: Map<string, ApprovalCard> = new Map();
  private memoryAutomations: Map<string, AutomationRunLog> = new Map();

  constructor(dbPath?: string) {
    this.init(dbPath);
  }

  private init(customPath?: string) {
    if (typeof window !== 'undefined') {
      // Browser environment: use memory fallback
      this.isSqlite = false;
      this.seedInitialData();
      return;
    }

    try {
      // Dynamic require so browser bundlers won't fail
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = require('fs');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const path = require('path');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { DatabaseSync } = require('node:sqlite');
      const targetPath =
        customPath ||
        (process.env.DB_PATH
          ? process.env.DB_PATH
          : path.join(process.cwd(), 'data', 'printad_office.sqlite'));

      if (targetPath !== ':memory:') {
        const dir = path.dirname(targetPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
      }

      this.db = new DatabaseSync(targetPath);
      this.isSqlite = true;
      this.createTables();
    } catch {
      // Fallback to in-memory mode if sqlite is not available
      this.isSqlite = false;
      this.seedInitialData();
    }
  }

  private createTables() {
    if (!this.db) return;

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        task_id TEXT,
        customer_name TEXT,
        product_type TEXT,
        specs_summary TEXT,
        quantity INTEGER,
        subtotal_vnd REAL,
        discount_percent REAL,
        vat_vnd REAL,
        grand_total_vnd REAL,
        status TEXT,
        formal_document_id TEXT,
        created_at TEXT,
        updated_at TEXT
      );

      CREATE TABLE IF NOT EXISTS formal_documents (
        id TEXT PRIMARY KEY,
        order_id TEXT,
        document_type TEXT,
        title TEXT,
        document_number TEXT,
        content TEXT,
        legal_basis TEXT,
        created_at TEXT
      );

      CREATE TABLE IF NOT EXISTS approval_cards (
        id TEXT PRIMARY KEY,
        task_id TEXT,
        order_id TEXT,
        title TEXT,
        department_id TEXT,
        agent_id TEXT,
        agent_name TEXT,
        required_approver TEXT,
        risk_level TEXT,
        triggers_json TEXT,
        total_amount_formatted TEXT,
        raw_amount_vnd REAL,
        discount_percent REAL,
        customer_name TEXT,
        product_summary TEXT,
        status TEXT,
        reviewed_by TEXT,
        reviewed_at TEXT,
        review_note TEXT,
        created_at TEXT
      );

      CREATE TABLE IF NOT EXISTS automation_runs (
        id TEXT PRIMARY KEY,
        job_id TEXT,
        title TEXT,
        status TEXT,
        executed_at TEXT,
        duration_ms INTEGER,
        summary TEXT,
        report_headline TEXT,
        key_findings_json TEXT,
        total_amount_formatted TEXT
      );
    `);

    // Check if table is empty and seed initial data
    try {
      const cnt = this.db.prepare('SELECT COUNT(*) as c FROM approval_cards').get();
      if (cnt && cnt.c === 0) {
        this.seedInitialData();
      }
    } catch {
      // Ignored
    }
  }

  public seedInitialData() {
    const card1: ApprovalCard = {
      id: 'appr-seed-01',
      taskId: 'task-seed-01',
      orderId: 'PO-2026-8812',
      title: 'Duyệt Báo giá & Hợp đồng In 2.000m² Bạt Hiflex — Takata Vietnam (68.000.000đ)',
      departmentId: 'sales_b2b',
      agentId: 'agent-dekisugi',
      agentName: 'Dekisugi (Kinh Doanh B2B)',
      requiredApprover: 'Doraemon — Giám Đốc Điều Hành (CEO)',
      riskLevel: 'critical',
      triggers: [
        'Giá trị hợp đồng đặc biệt lớn: 68.000.000đ (≥ 50.000.000đ)',
        'Chiết khấu thương mại: 18% (vượt trần thẩm quyền tự duyệt Trưởng phòng 15%)',
        'Hợp đồng kinh tế B2B ràng buộc điều khoản phạt trần 8% theo Luật Thương mại'
      ],
      details: {
        totalAmountFormatted: '68.000.000đ',
        rawAmountVnd: 68000000,
        discountPercent: 18,
        customerName: 'Tập đoàn Takata Vietnam',
        productSummary: 'In 2.000m² Bạt Hiflex 3.2m gân mờ + 30 bộ Standee nhôm cuốn cao cấp'
      },
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const card2: ApprovalCard = {
      id: 'appr-seed-02',
      taskId: 'task-seed-02',
      orderId: 'PO-2026-9045',
      title: 'Duyệt Lệnh In Hỏa Tốc 800 Cuốn Catalogue Triển Lãm (14.200.000đ)',
      departmentId: 'sales_quoting',
      agentId: 'agent-shizuka',
      agentName: 'Shizuka (CSKH & Báo Giá)',
      requiredApprover: 'Doraemon — Giám Đốc Điều Hành (CEO)',
      riskLevel: 'high',
      triggers: [
        'Đơn hàng sản xuất hỏa tốc: Giao hàng trong vòng 12 giờ',
        'Chen lịch máy in Offset 4 màu Listron 8 vào ca đêm'
      ],
      details: {
        totalAmountFormatted: '14.200.000đ',
        rawAmountVnd: 14200000,
        discountPercent: 10,
        customerName: 'Khách sạn Mường Thanh Luxury',
        productSummary: 'Catalogue 24 trang ruột C150, bìa C250 cán màng mờ, đóng kim giữa',
        isRushOrder: true
      },
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    this.saveApprovalCard(card1);
    this.saveApprovalCard(card2);

    this.saveOrder({
      id: 'PO-2026-8812',
      taskId: 'task-seed-01',
      customerName: 'Tập đoàn Takata Vietnam',
      productType: 'hiflex',
      specsSummary: 'Bạt Hiflex 3.2m (2000m²), Standee nhôm 30 bộ, đóng khoen dán mép',
      quantity: 2000,
      subtotalVnd: 72000000,
      discountPercent: 18,
      vatVnd: 5440000,
      grandTotalVnd: 68000000,
      status: 'pending_approval',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      updatedAt: new Date().toISOString()
    });

    this.saveOrder({
      id: 'PO-2026-9045',
      taskId: 'task-seed-02',
      customerName: 'Khách sạn Mường Thanh Luxury',
      productType: 'catalogue',
      specsSummary: 'Catalogue A4 24 trang, Ruột C150, Bìa C250 cán màng',
      quantity: 800,
      subtotalVnd: 13500000,
      discountPercent: 10,
      vatVnd: 1080000,
      grandTotalVnd: 14200000,
      status: 'approved',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      updatedAt: new Date().toISOString()
    });

    this.saveOrder({
      id: 'PO-2026-7520',
      taskId: 'task-seed-03',
      customerName: 'Chuỗi Highlands Coffee',
      productType: 'decal_pp',
      specsSummary: 'Decal PP trong nhà cán màng mờ bồi formex 5mm',
      quantity: 120,
      subtotalVnd: 4200000,
      discountPercent: 12,
      vatVnd: 324000,
      grandTotalVnd: 4053888,
      status: 'completed',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      updatedAt: new Date().toISOString()
    });

    this.saveDocument({
      id: 'DOC-CONTRACT-01',
      orderId: 'PO-2026-8812',
      documentType: 'contract',
      title: 'Hợp Đồng Kinh Tế B2B — Cung Ứng Vật Phẩm Quảng Cáo In Ấn 2026',
      documentNumber: 'HĐKT-2026/10-TAKATA',
      content: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n\nHỢP ĐỒNG KINH TẾ B2B\nSố: HĐKT-2026/10-TAKATA\n\nCăn cứ Luật Thương mại số 36/2005/QH11;\nBÊN A: CÔNG TY IN ẤN & QUẢNG CÁO PRINTAD 3D\nBÊN B: CÔNG TY TNHH TAKATA VIETNAM\n\nĐIỀU 1: PHẠM VI CUNG ỨNG VÀ BÁO GIÁ\nBên A nhận gia công in ấn 2.000m² bạt Hiflex chất lượng cao và 30 bộ Standee.\nTổng giá trị: 68.000.000 VNĐ (Đã bao gồm VAT 8%).\n\nĐIỀU 2: TIẾN ĐỘ & BẢO LÃNH SLA\nBên A cam kết hoàn tất giao hàng trong 48 giờ. Phạt vi phạm trần 8% theo luật định nếu chậm trễ.',
      legalBasis: 'Luật Thương mại số 36/2005/QH11 & Bộ luật Dân sự 2015',
      createdAt: new Date().toISOString()
    });
  }

  // --- ORDERS ---
  public saveOrder(order: OrderRecord): OrderRecord {
    if (this.isSqlite && this.db) {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO orders (
          id, task_id, customer_name, product_type, specs_summary, quantity,
          subtotal_vnd, discount_percent, vat_vnd, grand_total_vnd, status,
          formal_document_id, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        order.id,
        order.taskId,
        order.customerName,
        order.productType,
        order.specsSummary,
        order.quantity,
        order.subtotalVnd,
        order.discountPercent,
        order.vatVnd,
        order.grandTotalVnd,
        order.status,
        order.formalDocumentId || null,
        order.createdAt,
        order.updatedAt
      );
    }
    this.memoryOrders.set(order.id, order);
    return order;
  }

  public getOrder(id: string): OrderRecord | null {
    if (this.isSqlite && this.db) {
      const stmt = this.db.prepare('SELECT * FROM orders WHERE id = ?');
      const row = stmt.get(id);
      if (row) {
        return {
          id: row.id,
          taskId: row.task_id,
          customerName: row.customer_name,
          productType: row.product_type,
          specsSummary: row.specs_summary,
          quantity: row.quantity,
          subtotalVnd: row.subtotal_vnd,
          discountPercent: row.discount_percent,
          vatVnd: row.vat_vnd,
          grandTotalVnd: row.grand_total_vnd,
          status: row.status,
          formalDocumentId: row.formal_document_id || undefined,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        };
      }
    }
    return this.memoryOrders.get(id) || null;
  }

  public listOrders(limit: number = 50): OrderRecord[] {
    if (this.isSqlite && this.db) {
      const stmt = this.db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT ?');
      const rows = stmt.all(limit);
      return rows.map((r: any) => ({
        id: r.id,
        taskId: r.task_id,
        customerName: r.customer_name,
        productType: r.product_type,
        specsSummary: r.specs_summary,
        quantity: r.quantity,
        subtotalVnd: r.subtotal_vnd,
        discountPercent: r.discount_percent,
        vatVnd: r.vat_vnd,
        grandTotalVnd: r.grand_total_vnd,
        status: r.status,
        formalDocumentId: r.formal_document_id || undefined,
        createdAt: r.created_at,
        updatedAt: r.updated_at
      }));
    }
    return Array.from(this.memoryOrders.values())
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }

  public updateOrderStatus(id: string, status: OrderRecord['status']): boolean {
    const now = new Date().toISOString();
    if (this.isSqlite && this.db) {
      const stmt = this.db.prepare('UPDATE orders SET status = ?, updated_at = ? WHERE id = ?');
      stmt.run(status, now, id);
    }
    const mem = this.memoryOrders.get(id);
    if (mem) {
      mem.status = status;
      mem.updatedAt = now;
      return true;
    }
    return false;
  }

  // --- FORMAL DOCUMENTS ---
  public saveDocument(doc: DocumentRecord): DocumentRecord {
    if (this.isSqlite && this.db) {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO formal_documents (
          id, order_id, document_type, title, document_number, content, legal_basis, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        doc.id,
        doc.orderId || null,
        doc.documentType,
        doc.title,
        doc.documentNumber,
        doc.content,
        doc.legalBasis,
        doc.createdAt
      );
    }
    this.memoryDocs.set(doc.id, doc);
    return doc;
  }

  public listDocuments(limit: number = 30): DocumentRecord[] {
    if (this.isSqlite && this.db) {
      const stmt = this.db.prepare('SELECT * FROM formal_documents ORDER BY created_at DESC LIMIT ?');
      const rows = stmt.all(limit);
      return rows.map((r: any) => ({
        id: r.id,
        orderId: r.order_id || undefined,
        documentType: r.document_type,
        title: r.title,
        documentNumber: r.document_number,
        content: r.content,
        legalBasis: r.legal_basis,
        createdAt: r.created_at
      }));
    }
    return Array.from(this.memoryDocs.values())
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }

  // --- APPROVAL CARDS ---
  public saveApprovalCard(card: ApprovalCard): ApprovalCard {
    if (this.isSqlite && this.db) {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO approval_cards (
          id, task_id, order_id, title, department_id, agent_id, agent_name,
          required_approver, risk_level, triggers_json, total_amount_formatted,
          raw_amount_vnd, discount_percent, customer_name, product_summary,
          status, reviewed_by, reviewed_at, review_note, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        card.id,
        card.taskId,
        card.orderId || null,
        card.title,
        card.departmentId,
        card.agentId,
        card.agentName,
        card.requiredApprover,
        card.riskLevel,
        JSON.stringify(card.triggers),
        card.details.totalAmountFormatted,
        card.details.rawAmountVnd,
        card.details.discountPercent,
        card.details.customerName || null,
        card.details.productSummary,
        card.status,
        card.reviewedBy || null,
        card.reviewedAt || null,
        card.reviewNote || null,
        card.createdAt
      );
    }
    this.memoryApprovals.set(card.id, card);
    return card;
  }

  public getApprovalCard(id: string): ApprovalCard | null {
    if (this.isSqlite && this.db) {
      const stmt = this.db.prepare('SELECT * FROM approval_cards WHERE id = ?');
      const r = stmt.get(id);
      if (r) {
        let triggers: string[] = [];
        try {
          triggers = JSON.parse(r.triggers_json);
        } catch {
          triggers = [];
        }
        return {
          id: r.id,
          taskId: r.task_id,
          orderId: r.order_id || undefined,
          title: r.title,
          departmentId: r.department_id,
          agentId: r.agent_id,
          agentName: r.agent_name,
          requiredApprover: r.required_approver,
          riskLevel: r.risk_level,
          triggers,
          details: {
            totalAmountFormatted: r.total_amount_formatted,
            rawAmountVnd: r.raw_amount_vnd,
            discountPercent: r.discount_percent,
            customerName: r.customer_name || undefined,
            productSummary: r.product_summary
          },
          status: r.status,
          reviewedBy: r.reviewed_by || undefined,
          reviewedAt: r.reviewed_at || undefined,
          reviewNote: r.review_note || undefined,
          createdAt: r.created_at
        };
      }
    }
    return this.memoryApprovals.get(id) || null;
  }

  public listApprovalCards(filterStatus?: ApprovalCard['status']): ApprovalCard[] {
    if (this.isSqlite && this.db) {
      let query = 'SELECT * FROM approval_cards ORDER BY created_at DESC';
      const params: any[] = [];
      if (filterStatus) {
        query = 'SELECT * FROM approval_cards WHERE status = ? ORDER BY created_at DESC';
        params.push(filterStatus);
      }
      const stmt = this.db.prepare(query);
      const rows = params.length > 0 ? stmt.all(...params) : stmt.all();
      return rows.map((r: any) => {
        let triggers: string[] = [];
        try {
          triggers = JSON.parse(r.triggers_json);
        } catch {
          triggers = [];
        }
        return {
          id: r.id,
          taskId: r.task_id,
          orderId: r.order_id || undefined,
          title: r.title,
          departmentId: r.department_id,
          agentId: r.agent_id,
          agentName: r.agent_name,
          requiredApprover: r.required_approver,
          riskLevel: r.risk_level,
          triggers,
          details: {
            totalAmountFormatted: r.total_amount_formatted,
            rawAmountVnd: r.raw_amount_vnd,
            discountPercent: r.discount_percent,
            customerName: r.customer_name || undefined,
            productSummary: r.product_summary
          },
          status: r.status,
          reviewedBy: r.reviewed_by || undefined,
          reviewedAt: r.reviewed_at || undefined,
          reviewNote: r.review_note || undefined,
          createdAt: r.created_at
        };
      });
    }

    const cards = Array.from(this.memoryApprovals.values());
    if (filterStatus) {
      return cards
        .filter((c) => c.status === filterStatus)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    return cards.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  // --- AUTOMATION RUNS ---
  public saveAutomationRun(log: AutomationRunLog): AutomationRunLog {
    if (this.isSqlite && this.db) {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO automation_runs (
          id, job_id, title, status, executed_at, duration_ms, summary,
          report_headline, key_findings_json, total_amount_formatted
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        log.id,
        log.jobId,
        log.title,
        log.status,
        log.executedAt,
        log.durationMs,
        log.summary,
        log.reportHeadline,
        JSON.stringify(log.keyFindings),
        log.totalAmountFormatted || null
      );
    }
    this.memoryAutomations.set(log.id, log);
    return log;
  }

  public listAutomationRuns(limit: number = 20): AutomationRunLog[] {
    if (this.isSqlite && this.db) {
      const stmt = this.db.prepare('SELECT * FROM automation_runs ORDER BY executed_at DESC LIMIT ?');
      const rows = stmt.all(limit);
      return rows.map((r: any) => {
        let findings: string[] = [];
        try {
          findings = JSON.parse(r.key_findings_json);
        } catch {
          findings = [];
        }
        return {
          id: r.id,
          jobId: r.job_id,
          title: r.title,
          status: r.status,
          executedAt: r.executed_at,
          durationMs: r.duration_ms,
          summary: r.summary,
          reportHeadline: r.report_headline,
          keyFindings: findings,
          totalAmountFormatted: r.total_amount_formatted || undefined
        };
      });
    }
    return Array.from(this.memoryAutomations.values())
      .sort((a, b) => b.executedAt.localeCompare(a.executedAt))
      .slice(0, limit);
  }

  // --- METRICS ---
  public getStats(): DatabaseStats {
    let totalOrders = 0;
    let totalRevenueVnd = 0;
    let pendingApprovals = 0;
    let approvedOrders = 0;
    let totalDocuments = 0;
    let totalAutomationsRun = 0;

    if (this.isSqlite && this.db) {
      const orderRow = this.db.prepare(`
        SELECT COUNT(*) as cnt, COALESCE(SUM(grand_total_vnd), 0) as rev,
               SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_cnt
        FROM orders
      `).get();
      totalOrders = orderRow?.cnt || 0;
      totalRevenueVnd = orderRow?.rev || 0;
      approvedOrders = orderRow?.approved_cnt || 0;

      const apprRow = this.db.prepare(`
        SELECT COUNT(*) as pending_cnt FROM approval_cards WHERE status = 'pending'
      `).get();
      pendingApprovals = apprRow?.pending_cnt || 0;

      const docRow = this.db.prepare('SELECT COUNT(*) as doc_cnt FROM formal_documents').get();
      totalDocuments = docRow?.doc_cnt || 0;

      const autoRow = this.db.prepare('SELECT COUNT(*) as auto_cnt FROM automation_runs').get();
      totalAutomationsRun = autoRow?.auto_cnt || 0;
    } else {
      totalOrders = this.memoryOrders.size;
      for (const o of this.memoryOrders.values()) {
        totalRevenueVnd += o.grandTotalVnd;
        if (o.status === 'approved') approvedOrders++;
      }
      for (const a of this.memoryApprovals.values()) {
        if (a.status === 'pending') pendingApprovals++;
      }
      totalDocuments = this.memoryDocs.size;
      totalAutomationsRun = this.memoryAutomations.size;
    }

    return {
      totalOrders,
      totalRevenueVnd,
      pendingApprovals,
      approvedOrders,
      totalDocuments,
      totalAutomationsRun
    };
  }
}

// Global database singleton
export const db = new EnterpriseDatabase();
