import { useAuthContext } from '../state/AuthContext.js';

const dashboardSummary = {
  totalProjects: 1,
  totalPackageRuns: 1,
  pendingApprovals: 1,
  approvedPackages: 0,
  rejectedPackages: 0,
  riskLevelSummary: {
    level3: 1,
  },
  recentAuditEvents: [
    { type: 'CONSOLIDATED_REPORT', message: 'Generated package report.', packageId: 'VS-BP-01-ENG-FAB-PKG' },
    { type: 'QUOTATION', message: 'Generated quotation summary.', packageId: 'VS-BP-01-ENG-FAB-PKG' },
  ],
  recentModelRoleEvents: [
    { capability: 'SteelDesignPack', requestedRole: 'engineering_reasoning_model', packageId: 'VS-BP-01-ENG-FAB-PKG' },
    { capability: 'WorkflowIntentClassifier', requestedRole: 'orchestration_model', packageId: 'VS-BP-01-ENG-FAB-PKG' },
  ],
  recentExports: [
    { exportType: 'markdown', filename: 'VS-BP-01-ENG-FAB-PKG-REV-00.md' },
    { exportType: 'json', filename: 'VS-BP-01-ENG-FAB-PKG-REV-00.json' },
  ],
};

export function ProjectDashboard() {
  const auth = useAuthContext();

  return (
    <main className="project-dashboard">
      <header>
        <p>VALOR STRUCT / AGENTICFLOW</p>
        <p>Demo Mode badge</p>
        <h1>Valor Struct / AgenticFlow Project Dashboard</h1>
        <p>Product-level dashboard for persisted project, package, approval, audit, model-role, and export activity.</p>
      </header>

      <section aria-label="Current User Workspace Panel">
        <h2>current user panel</h2>
        <p>role display: {auth.currentUser?.role ?? 'Not authenticated'}</p>
        <p>workspace display: {auth.workspace?.companyName ?? 'No workspace selected'}</p>
        <p>Current user: {auth.currentUser?.email ?? 'anonymous'}</p>
        <button type="button" onClick={auth.logout}>logout button</button>
      </section>

      <section aria-label="Dashboard Summary Cards">
        <h2>Dashboard Summary Cards</h2>
        <article aria-label="Total Projects Card">
          <h3>total projects card</h3>
          <p>{dashboardSummary.totalProjects}</p>
        </article>
        <article aria-label="Package Runs Card">
          <h3>package runs card</h3>
          <p>{dashboardSummary.totalPackageRuns}</p>
        </article>
        <article aria-label="Pending Approvals Card">
          <h3>pending approvals card</h3>
          <p>{dashboardSummary.pendingApprovals}</p>
        </article>
        <article aria-label="Approved Packages Card">
          <h3>approved packages card</h3>
          <p>{dashboardSummary.approvedPackages}</p>
        </article>
        <article aria-label="Rejected Packages Card">
          <h3>rejected packages card</h3>
          <p>{dashboardSummary.rejectedPackages}</p>
        </article>
      </section>

      <section aria-label="Risk Level Summary">
        <h2>risk level summary</h2>
        <ul>
          {Object.entries(dashboardSummary.riskLevelSummary).map(([level, count]) => (
            <li key={level}>{level}: {count}</li>
          ))}
        </ul>
      </section>

      <section aria-label="Recent Audit Events Panel">
        <h2>recent audit events panel</h2>
        <ul>
          {dashboardSummary.recentAuditEvents.map((event) => (
            <li key={`${event.packageId}-${event.type}`}>{event.packageId}: {event.type} — {event.message}</li>
          ))}
        </ul>
      </section>

      <section aria-label="Recent Model-Role Audit Events Panel">
        <h2>recent model-role audit events panel</h2>
        <ul>
          {dashboardSummary.recentModelRoleEvents.map((event) => (
            <li key={`${event.packageId}-${event.capability}`}>{event.packageId}: {event.capability} requested {event.requestedRole}</li>
          ))}
        </ul>
      </section>

      <section aria-label="Recent Exports Panel">
        <h2>recent exports panel</h2>
        <ul>
          {dashboardSummary.recentExports.map((exportRecord) => (
            <li key={exportRecord.filename}>{exportRecord.exportType}: {exportRecord.filename}</li>
          ))}
        </ul>
      </section>

      <section aria-label="Project-Level Approval Package Flow">
        <h2>Project-level approval package flow</h2>
        <ol>
          <li>Project</li>
          <li>Multiple parts</li>
          <li>Combined BOQ</li>
          <li>Combined manufacturing plan</li>
          <li>Combined quotation</li>
          <li>Project-level approval package</li>
        </ol>
      </section>

      <section aria-label="Quick Links">
        <h2>quick links to EngineeringPackageConsole and PackageHistoryConsole</h2>
        <a href="./EngineeringPackageConsole">EngineeringPackageConsole</a>
        <a href="./PackageHistoryConsole">PackageHistoryConsole</a>
        <article aria-label="Multi-Part Package Console Quick Link">
          <h3>Multi-Part Package Console</h3>
          <p>Create project-level packages from multiple drawing-note parts.</p>
          <a href="./MultiPartPackageConsole">Open Multi-Part Package Console</a>
        </article>
        <article aria-label="Pilot Demo Checklist Quick Link">
          <h3>Pilot Demo Checklist</h3>
          <p>Guided login-to-approved/exported package walkthrough for the Canopy Base Plates Demo.</p>
          <a href="./PilotDemoChecklist">Open Pilot Demo Checklist</a>
        </article>
      </section>
    </main>
  );
}

export default ProjectDashboard;
