// Aeolus browser evaluate snippets
// 用途：给托管浏览器 evaluate / console 直接复用

export const WAIT_FOR_AGENT_FUNCS = `
async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  for (let i = 0; i < 35; i++) {
    if (typeof window.getReportInfoForllmForVizQuery === 'function' && typeof window.getDataQueryDatasetForAgent === 'function') {
      return { ok: true, tries: i + 1 };
    }
    await sleep(1000);
  }
  return { ok: false };
}
`;

export const EXTRACT_CORE_INFO = `
async () => {
  const report = await window.getReportInfoForllmForVizQuery();
  const dataset = await window.getDataQueryDatasetForAgent();
  const q = report?.data || {};
  const url = new URL(location.href);
  return {
    href: location.href,
    linkFingerprint: {
      appId: url.searchParams.get('appId'),
      dashboardId: url.searchParams.get('dashboardId'),
      inputId: url.searchParams.get('id'),
      currentId: url.searchParams.get('id'),
      sid: url.searchParams.get('sid'),
      rid: url.searchParams.get('rid'),
      reportQuerySchemaKey: url.searchParams.get('reportQuerySchemaKey'),
      queryHistoryId: q.queryHistoryId || null,
      datasetId: q.metaData?.dataSetId || dataset?.id || null,
      datasetName: q.metaData?.dataSetName || dataset?.name || null,
      chartType: q.vizData?.chartType || null
    },
    sqlList: q.sqlList || [],
    whereList: q.reqJson?.query?.whereList || [],
    dimMetList: q.reqJson?.query?.dimMetList || [],
    vizData: q.vizData || null,
    dataset: {
      id: dataset?.id,
      name: dataset?.name,
      dimensionList: dataset?.dimensionList || [],
      metricsList: dataset?.metricsList || []
    }
  };
}
`;

export const INJECT_LOG_PANEL = `
async () => {
  let panel = document.getElementById('__aeolus_agent_log_panel__');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = '__aeolus_agent_log_panel__';
    panel.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:999999;width:430px;max-height:60vh;overflow:auto;background:rgba(17,24,39,.96);color:#e5f0ff;border:1px solid rgba(255,255,255,.12);border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.35);font:12px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;padding:12px;white-space:pre-wrap;';
    const title = document.createElement('div');
    title.textContent = 'OpenClaw · Aeolus 托管执行日志';
    title.style.cssText = 'font-weight:700;color:#93c5fd;margin-bottom:8px;position:sticky;top:0;background:rgba(17,24,39,.96);padding-bottom:6px;';
    panel.appendChild(title);
    const body = document.createElement('div');
    body.id = '__aeolus_agent_log_body__';
    panel.appendChild(body);
    document.body.appendChild(panel);
  }
  return { ok: true };
}
`;
