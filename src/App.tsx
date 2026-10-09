import React, { useState, useEffect } from 'react';
import { Layout, PageId } from './components/Layout';
import { LiveProductionPage } from './pages/LiveProductionPage';
import { InspectPage } from './pages/InspectPage';
import { DefectAnalysisPage } from './pages/DefectAnalysisPage';
import { InvestigationPage } from './pages/InvestigationPage';
import { QualityReportPage } from './pages/QualityReportPage';
import { ReviewFeedbackPage } from './pages/ReviewFeedbackPage';
import { SystemHealthPage } from './pages/SystemHealthPage';
import { InspectionHistoryPage } from './pages/InspectionHistoryPage';
import { InspectionRecord, ProductProfile } from './types';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('live');
  const [selectedProduct, setSelectedProduct] = useState<string>('all');
  const [products, setProducts] = useState<ProductProfile[]>([]);
  const [history, setHistory] = useState<InspectionRecord[]>([]);
  const [currentInspection, setCurrentInspection] = useState<InspectionRecord | null>(null);
  const [selectedForInspection, setSelectedForInspection] = useState<InspectionRecord | null>(null);

  // Simulator controls
  const [isSimulatorActive, setIsSimulatorActive] = useState<boolean>(true);
  const [simulatorSpeed, setSimulatorSpeed] = useState<number>(1);
  const [activeFault, setActiveFault] = useState<string | null>(null);

  // 1. Initial Data Fetch
  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => {
        setProducts(data);
      })
      .catch(console.error);

    fetch('/api/inspections?limit=100')
      .then((r) => r.json())
      .then((data) => {
        if (data.items && data.items.length > 0) {
          setHistory(data.items);
          setCurrentInspection(data.items[0]);
          setSelectedForInspection(data.items[0]);
        }
      })
      .catch(console.error);
  }, []);

  // 2. Connect to SSE Stream for Live Conveyor
  useEffect(() => {
    const evtSource = new EventSource('/api/stream');

    evtSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'INSPECTION') {
          const item: InspectionRecord = payload.data;
          setCurrentInspection(item);
          setHistory((prev) => [item, ...prev.slice(0, 500)]);
        } else if (payload.type === 'SIMULATOR_STATE') {
          setIsSimulatorActive(payload.running);
          setSimulatorSpeed(payload.speed);
          setActiveFault(payload.fault);
        } else if (payload.type === 'SIMULATOR_FAULT') {
          setActiveFault(payload.fault);
        }
      } catch (e) {
        console.error('SSE JSON error', e);
      }
    };

    return () => {
      evtSource.close();
    };
  }, []);

  // Simulator Control Handlers
  const handleToggleSimulator = () => {
    const endpoint = isSimulatorActive ? '/api/simulator/pause' : '/api/simulator/start';
    fetch(endpoint, { method: 'POST' })
      .then((r) => r.json())
      .then((data) => setIsSimulatorActive(data.running))
      .catch(console.error);
  };

  const handleSpeedChange = (speed: number) => {
    setSimulatorSpeed(speed);
    fetch('/api/simulator/speed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ speed })
    }).catch(console.error);
  };

  const handleInjectFault = (fault: string) => {
    fetch('/api/simulator/fault', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fault })
    })
      .then((r) => r.json())
      .then((d) => setActiveFault(d.active_fault))
      .catch(console.error);
  };

  // Interactive Inspect Handler
  const handleInspectNew = (
    productId: string,
    options: { simulateDefect?: boolean; simulateBlur?: boolean; simulateDark?: boolean }
  ) => {
    fetch('/api/inspect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: productId,
        simulate_defect: options.simulateDefect,
        simulate_blur: options.simulateBlur,
        simulate_dark: options.simulateDark
      })
    })
      .then((r) => r.json())
      .then((res: InspectionRecord) => {
        setSelectedForInspection(res);
        setHistory((prev) => [res, ...prev]);
      })
      .catch(console.error);
  };

  // Review Feedback Submit
  const handleReviewSubmit = (id: string, action: string, reason: string, annotatedDefect?: string) => {
    fetch(`/api/inspections/${id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, reason, annotated_defect: annotatedDefect })
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.updated_inspection) {
          setHistory((prev) =>
            prev.map((i) => (i.inspection_id === id ? res.updated_inspection : i))
          );
        }
      })
      .catch(console.error);
  };

  const handleSelectInspectionForInspect = (inspection: InspectionRecord) => {
    setSelectedForInspection(inspection);
    setCurrentPage('inspect');
  };

  // Filter history if global product is chosen
  const filteredHistory =
    selectedProduct === 'all'
      ? history
      : history.filter((i) => i.product_id === selectedProduct);

  return (
    <Layout
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      selectedProduct={selectedProduct}
      onProductChange={setSelectedProduct}
      products={products}
      isSimulatorActive={isSimulatorActive}
    >
      {currentPage === 'live' && (
        <LiveProductionPage
          currentInspection={currentInspection}
          history={filteredHistory}
          isSimulatorActive={isSimulatorActive}
          onToggleSimulator={handleToggleSimulator}
          onInjectFault={handleInjectFault}
          activeFault={activeFault}
          simulatorSpeed={simulatorSpeed}
          onChangeSpeed={handleSpeedChange}
          onSelectInspection={handleSelectInspectionForInspect}
        />
      )}

      {currentPage === 'inspect' && (
        <InspectPage
          inspection={selectedForInspection || currentInspection}
          onInspectNew={handleInspectNew}
          availableProducts={products}
        />
      )}

      {currentPage === 'analysis' && (
        <DefectAnalysisPage selectedProduct={selectedProduct} />
      )}

      {currentPage === 'investigation' && <InvestigationPage />}

      {currentPage === 'report' && <QualityReportPage />}

      {currentPage === 'review' && (
        <ReviewFeedbackPage
          inspections={filteredHistory}
          onReviewSubmit={handleReviewSubmit}
        />
      )}

      {currentPage === 'health' && <SystemHealthPage />}

      {currentPage === 'history' && (
        <InspectionHistoryPage
          inspections={filteredHistory}
          onSelectInspection={handleSelectInspectionForInspect}
        />
      )}
    </Layout>
  );
}
