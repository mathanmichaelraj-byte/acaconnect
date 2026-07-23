import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from '../api/axios';
import ParticipantsModal from '../components/ParticipantsModal';

export default function TreasurerDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ pendingApproval: 0, approved: 0, rejected: 0 });
  const [events, setEvents] = useState([]);
  const [activeView, setActiveView] = useState('overview');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [budgetForm, setBudgetForm] = useState({
    prize_pool: '',
    total_budget: '',
    registration_fee: '',
    comments: ''
  });
  const [budgetPrediction, setBudgetPrediction] = useState(null);
  const [predictingBudget, setPredictingBudget] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [verificationHistory, setVerificationHistory] = useState([]);
  const [selectedReg, setSelectedReg] = useState(null);
  const [verificationComments, setVerificationComments] = useState('');
  const [processing, setProcessing] = useState(false);
  const [expenseEvents, setExpenseEvents] = useState([]);
  const [onsiteRegistrations, setOnsiteRegistrations] = useState([]);
  const [selectedOnsiteReg, setSelectedOnsiteReg] = useState(null);
  const [onsiteComments, setOnsiteComments] = useState('');
  const [processingOnsite, setProcessingOnsite] = useState(false);
  const [allOnsiteRegistrations, setAllOnsiteRegistrations] = useState([]);
  const [incomeAnalytics, setIncomeAnalytics] = useState(null);
  const [expenseAnalytics, setExpenseAnalytics] = useState(null);
  const [profitAnalysis, setProfitAnalysis] = useState(null);
  const [loadingFinancial, setLoadingFinancial] = useState(false);
  const [budgetVariance, setBudgetVariance] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [selectedEventForParticipants, setSelectedEventForParticipants] = useState(null);
  const [priceEvent, setPriceEvent] = useState(null);
  const [newPrice, setNewPrice] = useState('');
  const [priceUpdating, setPriceUpdating] = useState(false);

  const fetchPendingVerifications = async () => {
    try {
      const response = await axios.get('/registrations/pending-verifications');
      setRegistrations(response.data.registrations);
    } catch (error) {
      console.error('Failed to fetch pending verifications:', error);
    }
  };

  const fetchVerificationHistory = async () => {
    try {
      console.log('Fetching verification history...');
      const response = await axios.get('/registrations/verification-history');
      console.log('Verification history response:', response.data);
      setVerificationHistory(response.data.registrations || []);
    } catch (error) {
      console.error('Failed to fetch verification history:', error);
      setVerificationHistory([]);
    }
  };

  const fetchExpenseEvents = async () => {
    try {
      const response = await axios.get('/logistics/expense-events');
      setExpenseEvents(response.data);
    } catch (error) {
      console.error('Failed to fetch expense events:', error);
      setExpenseEvents([]);
    }
  };

  const fetchPendingOnsiteRegistrations = async () => {
    try {
      console.log('Fetching pending onsite registrations...');
      const response = await axios.get('/onsite-registrations/pending-payment');
      console.log('Pending onsite registrations response:', response.data);
      setOnsiteRegistrations(response.data.registrations);
    } catch (error) {
      console.error('Failed to fetch pending onsite registrations:', error);
      console.error('Error response:', error.response?.data);
      setOnsiteRegistrations([]);
    }
  };

  const handleConfirmOnsitePayment = async (registrationId, approved) => {
    setProcessingOnsite(true);
    try {
      await axios.post(`/onsite-registrations/${registrationId}/confirm-payment`, {
        approved,
        comments: onsiteComments
      });
      alert(approved ? 'Onsite payment confirmed successfully!' : 'Onsite payment rejected');
      setSelectedOnsiteReg(null);
      setOnsiteComments('');
      fetchPendingOnsiteRegistrations();
    } catch (error) {
      console.error('Onsite payment confirmation error:', error);
      alert('Failed to confirm onsite payment');
    } finally {
      setProcessingOnsite(false);
    }
  };

  const fetchOnsiteRegistrations = async () => {
    try {
      const response = await axios.get('/onsite-registrations');
      setAllOnsiteRegistrations(response.data.registrations);
    } catch (error) {
      console.error('Failed to fetch onsite registrations:', error);
      setAllOnsiteRegistrations([]);
    }
  };

  const fetchIncomeAnalytics = async () => {
    setLoadingFinancial(true);
    try {
      const response = await axios.get('/financial/income-analytics');
      setIncomeAnalytics(response.data.data);
    } catch (error) {
      console.error('Failed to fetch income analytics:', error);
      setIncomeAnalytics(null);
    } finally {
      setLoadingFinancial(false);
    }
  };

  const fetchExpenseAnalytics = async () => {
    setLoadingFinancial(true);
    try {
      const response = await axios.get('/financial/expense-analytics');
      setExpenseAnalytics(response.data.data);
    } catch (error) {
      console.error('Failed to fetch expense analytics:', error);
      setExpenseAnalytics(null);
    } finally {
      setLoadingFinancial(false);
    }
  };

  const fetchProfitAnalysis = async () => {
    setLoadingFinancial(true);
    try {
      const response = await axios.get('/financial/profit-analysis');
      setProfitAnalysis(response.data.data);
    } catch (error) {
      console.error('Failed to fetch profit analysis:', error);
      setProfitAnalysis(null);
    } finally {
      setLoadingFinancial(false);
    }
  };

  const fetchBudgetVariance = async () => {
    setLoadingFinancial(true);
    try {
      const response = await axios.get('/financial/budget-variance');
      setBudgetVariance(response.data);
    } catch (error) {
      console.error('Failed to fetch budget variance:', error);
      setBudgetVariance(null);
    } finally {
      setLoadingFinancial(false);
    }
  };

  const fetchChartData = async () => {
    try {
      const response = await axios.get('/financial/chart-data');
      setChartData(response.data.charts);
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
      setChartData(null);
    }
  };

  // Export functions
  const exportToCSV = (data, filename) => {
    const csvContent = convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const convertToCSV = (data) => {
    if (!data || data.length === 0) return '';
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    return [headers, ...rows].join('\n');
  };

  // Alternative simple PDF export
  const exportToPDFSimple = (data, filename, type) => {
    try {
      let content = '';
      
      if (type === 'income' && data) {
        content = `
          <h2>Income Report</h2>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>Event</th>
                <th>Type</th>
                <th>Total Income</th>
                <th>Online Income</th>
                <th>Onsite Income</th>
                <th>Registrations</th>
              </tr>
            </thead>
            <tbody>
              ${data.map(event => `
                <tr>
                  <td>${event.eventTitle}</td>
                  <td>${event.eventType}</td>
                  <td>₹${event.totalIncome.toLocaleString()}</td>
                  <td>₹${event.onlineIncome.toLocaleString()}</td>
                  <td>₹${event.onsiteIncome.toLocaleString()}</td>
                  <td>${event.totalRegistrations}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      } else if (type === 'expense' && data) {
        content = `
          <h2>Expense Report</h2>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>Event</th>
                <th>Type</th>
                <th>Total Expense</th>
                <th>Submitted Date</th>
                <th>Bill Status</th>
              </tr>
            </thead>
            <tbody>
              ${data.map(event => `
                <tr>
                  <td>${event.eventTitle}</td>
                  <td>${event.eventType}</td>
                  <td>₹${event.totalExpense.toLocaleString()}</td>
                  <td>${event.submittedAt ? new Date(event.submittedAt).toLocaleDateString() : 'N/A'}</td>
                  <td>${event.hasBillAttachment ? 'Attached' : 'Missing'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      }
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow popups to export PDF');
        return;
      }
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>NIRAL 2026 Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; color: black; }
              table { border-collapse: collapse; width: 100%; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
              th { background-color: #f5f5f5; font-weight: bold; }
              h2 { color: #333; margin-bottom: 10px; }
              p { color: #666; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            ${content}
          </body>
        </html>
      `);
      
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 500);
      
    } catch (error) {
      console.error('Simple PDF export error:', error);
      alert('Failed to export PDF');
    }
  };

  const handleVerifyPayment = async (registrationId, approved) => {
    setProcessing(true);
    try {
      await axios.post(`/registrations/${registrationId}/verify`, {
        approved,
        comments: verificationComments
      });
      alert(approved ? 'Payment verified successfully!' : 'Payment rejected');
      setSelectedReg(null);
      setVerificationComments('');
      fetchPendingVerifications();
    } catch (error) {
      console.error('Verification error:', error);
      alert('Failed to verify payment');
    } finally {
      setProcessing(false);
    }
  };

  const handleBackToOverview = () => {
    setActiveView('overview');
  };

  const handleUpdatePrice = async () => {
    if (newPrice === '' || Number(newPrice) < 0) return alert('Enter a valid price');
    setPriceUpdating(true);
    try {
      const res = await axios.put(`/events/${priceEvent._id}/update-price`, { registration_fee: Number(newPrice) });
      alert(res.data.message);
      setPriceEvent(null);
      setNewPrice('');
      fetchPendingEvents();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update price');
    } finally {
      setPriceUpdating(false);
    }
  };

  useEffect(() => {
    fetchPendingEvents();
    if (activeView === 'paymentVerification') {
      fetchPendingVerifications();
    }
    if (activeView === 'verificationHistory') {
      fetchVerificationHistory();
    }
    if (activeView === 'expenses') {
      fetchExpenseEvents();
    }
    if (activeView === 'onsitePayments') {
      fetchPendingOnsiteRegistrations();
    }
    if (activeView === 'onsiteHistory') {
      fetchOnsiteRegistrations();
    }
    if (activeView === 'incomeManager') {
      fetchIncomeAnalytics();
      fetchChartData();
    }
    if (activeView === 'expenseManager') {
      fetchExpenseAnalytics();
      fetchChartData();
    }
    if (activeView === 'profitAnalysis') {
      fetchProfitAnalysis();
    }
    if (activeView === 'budgetVariance') {
      fetchBudgetVariance();
    }
  }, [activeView]);

  const fetchPendingEvents = async () => {
    try {
      const response = await axios.get('/events');
      const allEvents = response.data;
      setEvents(allEvents);
      
      const pending = allEvents.filter(e => e.status === 'UNDER_REVIEW').length;
      const approved = allEvents.filter(e => ['TREASURER_APPROVED', 'GENSEC_APPROVED', 'CHAIRPERSON_APPROVED', 'PUBLISHED'].includes(e.status)).length;
      const rejected = allEvents.filter(e => e.status === 'REJECTED').length;
      
      setStats({ pendingApproval: pending, approved, rejected });
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setBudgetForm({
      prize_pool: event.prize_pool_required ? '' : '0',
      total_budget: '',
      registration_fee: event.registration_fee_required ? '' : '0',
      comments: ''
    });
    setBudgetPrediction(null);
    setActiveView('details');
  };

  const handleApproval = async (approved) => {
    try {
      await axios.put(`/events/${selectedEvent._id}/treasurer-approve`, {
        approved,
        comments: budgetForm.comments,
        prize_pool: approved ? budgetForm.prize_pool : null,
        total_budget: approved ? budgetForm.total_budget : null,
        registration_fee: approved ? budgetForm.registration_fee : null
      });
      alert(`Event ${approved ? 'approved' : 'rejected'} successfully!`);
      setActiveView('overview');
      fetchPendingEvents();
    } catch (error) {
      alert(`Failed to ${approved ? 'approve' : 'reject'}: ` + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const renderOverview = () => (
    <div className="card-grid fade-in">
      <div className="card">
        <h3 className="card-title">Budget Review</h3>
        <div className="card-content">
          <p><strong>Pending Approval:</strong> {stats.pendingApproval}</p>
          <p><strong>Approved:</strong> {stats.approved}</p>
          <p><strong>Rejected:</strong> {stats.rejected}</p>
        </div>
      </div>
      <div className="card">
        <h3 className="card-title">Actions</h3>
        <div className="card-content">
          <button className="btn btn-primary" onClick={() => setActiveView('pending')} style={{ margin: '0.25rem', width: '100%' }}>
            Review Pending Events
          </button>
          <button className="btn btn-success" onClick={() => setActiveView('approved')} style={{ margin: '0.25rem', width: '100%' }}>
            View Approved Events
          </button>
          <button className="btn btn-primary" onClick={() => setActiveView('paymentVerification')} style={{ margin: '0.25rem', width: '100%', background: 'linear-gradient(135deg, #F5B301, #FF8C00)' }}>
            Payment Verification
          </button>
          <button className="btn btn-secondary" onClick={() => setActiveView('verificationHistory')} style={{ margin: '0.25rem', width: '100%' }}>
            Verification History
          </button>
          <button className="btn btn-primary" onClick={() => setActiveView('expenses')} style={{ margin: '0.25rem', width: '100%' }}>
            View Expenses
          </button>
          <button className="btn btn-primary" onClick={() => setActiveView('onsitePayments')} style={{ margin: '0.25rem', width: '100%' }}>
            Onsite Payment Confirmation
          </button>
          <button className="btn btn-secondary" onClick={() => {
            setActiveView('onsiteHistory');
            fetchOnsiteRegistrations();
          }} style={{ margin: '0.25rem', width: '100%' }}>
            Onsite Payment History
          </button>
          <button className="btn btn-primary" onClick={() => setActiveView('incomeManager')} style={{ margin: '0.25rem', width: '100%' }}>
            Income Manager
          </button>
          <button className="btn btn-primary" onClick={() => setActiveView('expenseManager')} style={{ margin: '0.25rem', width: '100%' }}>
            Expense Manager
          </button>
          <button className="btn btn-primary" onClick={() => setActiveView('budgetVariance')} style={{ margin: '0.25rem', width: '100%' }}>
            Budget Variance Alerts
          </button>
          <button className="btn btn-primary" onClick={() => setActiveView('changePrice')} style={{ margin: '0.25rem', width: '100%' }}>
            Change Event Price
          </button>
        </div>
      </div>
    </div>
  );

  const renderPending = () => (
    <div className="fade-in">
      <div className="nav-header">
        <h3 className="nav-title">Pending Budget Approvals</h3>
        <button 
          onClick={handleBackToOverview}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#00E5FF', 
            fontSize: '0.85rem', 
            cursor: 'pointer',
            padding: '0.25rem 0',
            pointerEvents: 'auto',
            zIndex: 10,
            position: 'relative'
          }}
        >
          ← Back to Overview
        </button>
      </div>
      <div className="table-container" style={{
        background: 'rgba(28, 26, 46, 0.85)',
        borderRadius: '18px',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <table className="table" style={{
          width: '100%',
          borderCollapse: 'collapse',
          background: 'transparent'
        }}>
          <thead style={{
            background: 'rgba(15, 14, 34, 0.8)'
          }}>
            <tr>
              <th style={{
                padding: '1rem',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: '#B8B6D8'
              }}>Event</th>
              <th style={{
                padding: '1rem',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: '#B8B6D8'
              }}>Type</th>
              <th style={{
                padding: '1rem',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: '#B8B6D8'
              }}>Date</th>
              <th style={{
                padding: '1rem',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: '#B8B6D8'
              }}>Participants</th>
              <th style={{
                padding: '1rem',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: '#B8B6D8'
              }}>Prize Pool</th>
              <th style={{
                padding: '1rem',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: '#B8B6D8'
              }}>Status</th>
              <th style={{
                padding: '1rem',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: '#B8B6D8'
              }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.filter(e => e.status === 'UNDER_REVIEW').map(event => (
              <tr key={event._id}>
                <td style={{ padding: '1rem', color: '#F5F7FF' }}>{event.title}</td>
                <td style={{ padding: '1rem', color: '#F5F7FF' }}>{event.type}</td>
                <td style={{ padding: '1rem', color: '#F5F7FF' }}>{new Date(event.date).toLocaleDateString()}</td>
                <td style={{ padding: '1rem', color: '#F5F7FF' }}>{event.expected_participants}</td>
                <td style={{ padding: '1rem', color: '#F5F7FF' }}>₹{event.prize_pool}</td>
                <td style={{ padding: '1rem' }}><span className="status-badge status-pending">PENDING REVIEW</span></td>
                <td style={{ padding: '1rem' }}>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => handleEventClick(event)}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                  >
                    Review Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderEventDetails = () => (
    <div className="fade-in">
      <div className="nav-header">
        <h3 className="nav-title">Event Details - {selectedEvent?.title}</h3>
        <button 
          onClick={() => setActiveView('pending')}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#00E5FF', 
            fontSize: '0.85rem', 
            cursor: 'pointer',
            padding: '0.25rem 0',
            pointerEvents: 'auto',
            zIndex: 10,
            position: 'relative'
          }}
        >
          ← Back to List
        </button>
      </div>
      
      <div className="card-grid">
        <div className="card">
          <h3 className="card-title">Event Information</h3>
          <div className="card-content">
            <p><strong>Title:</strong> {selectedEvent?.title}</p>
            <p><strong>Type:</strong> {selectedEvent?.type}</p>
            <p><strong>Date:</strong> {new Date(selectedEvent?.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> {selectedEvent?.time}</p>
            <p><strong>Duration:</strong> {selectedEvent?.duration_hours} hours</p>
            <p><strong>Venue:</strong> {selectedEvent?.venue || 'TBD'}</p>
            <p><strong>Expected Participants:</strong> {selectedEvent?.expected_participants}</p>
          </div>
        </div>
        
        <div className="card">
          <h3 className="card-title">Budget Details</h3>
          <div className="card-content">
            <p><strong>Prize Pool Required:</strong> {selectedEvent?.prize_pool_required ? 'Yes' : 'No'}</p>
            {selectedEvent?.prize_pool_required && (
              <p><strong>Requested Prize Pool:</strong> ₹{selectedEvent?.prize_pool || 0}</p>
            )}
            <p><strong>Registration Fee Required:</strong> {selectedEvent?.registration_fee_required ? 'Yes' : 'No'}</p>
            {selectedEvent?.registration_fee_required && (
              <p><strong>Current Registration Fee:</strong> ₹{selectedEvent?.registration_fee || 0}</p>
            )}
          </div>
        </div>
        
        <div className="card">
          <h3 className="card-title">Requirements</h3>
          <div className="card-content">
            <p><strong>Volunteers:</strong> {selectedEvent?.requirements?.volunteers_needed || 0}</p>
            
            <div style={{ marginTop: '1rem' }}>
              <p><strong>Refreshments:</strong> {selectedEvent?.requirements?.refreshments_needed ? 'Yes' : 'No'}</p>
              {selectedEvent?.requirements?.refreshments_needed && selectedEvent?.requirements?.refreshment_items?.length > 0 && (
                <div style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                  <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Refreshment Items:</p>
                  {selectedEvent.requirements.refreshment_items.map((item, index) => (
                    <p key={index} style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0.2rem 0' }}>
                      • {item.item_name}: {item.quantity}
                    </p>
                  ))}
                </div>
              )}
            </div>
            
            <div style={{ marginTop: '1rem' }}>
              <p><strong>Stationery:</strong> {selectedEvent?.requirements?.stationary_needed ? 'Yes' : 'No'}</p>
              {selectedEvent?.requirements?.stationary_needed && selectedEvent?.requirements?.stationary_items?.length > 0 && (
                <div style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                  <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Stationery Items:</p>
                  {selectedEvent.requirements.stationary_items.map((item, index) => (
                    <p key={index} style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0.2rem 0' }}>
                      • {item.item_name}: {item.quantity}
                    </p>
                  ))}
                </div>
              )}
            </div>
            
            <div style={{ marginTop: '1rem' }}>
              <p><strong>Technical Equipment:</strong> {selectedEvent?.requirements?.technical_needed ? 'Yes' : 'No'}</p>
              {selectedEvent?.requirements?.technical_needed && selectedEvent?.requirements?.technical_items?.length > 0 && (
                <div style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                  <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Technical Items:</p>
                  {selectedEvent.requirements.technical_items.map((item, index) => (
                    <p key={index} style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0.2rem 0' }}>
                      • {item.item_name}: {item.quantity}
                    </p>
                  ))}
                </div>
              )}
            </div>
            
            <div style={{ marginTop: '1rem' }}>
              <p><strong>Goodies:</strong> {selectedEvent?.requirements?.goodies_needed ? 'Yes' : 'No'}</p>
              <p><strong>Physical Certificate:</strong> {selectedEvent?.requirements?.physical_certificate ? 'Yes' : 'No'}</p>
              <p><strong>Trophies:</strong> {selectedEvent?.requirements?.trophies_needed ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card" style={{ marginTop: '2rem' }}>
        <h3 className="card-title">Budget Allocation</h3>
        <div className="card-content">
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Review the event requirements above and enter the approved budget amounts below.
            </p>
          </div>
          {selectedEvent?.prize_pool_required && (
            <div className="form-group">
              <label className="form-label">Prize Pool Amount (₹)</label>
              <input 
                type="number" 
                className="form-input"
                placeholder="Enter prize pool amount"
                value={budgetForm.prize_pool}
                onChange={(e) => setBudgetForm({...budgetForm, prize_pool: e.target.value})}
              />
            </div>
          )}
          
          {selectedEvent?.registration_fee_required && (
            <div className="form-group">
              <label className="form-label">Registration Fee (₹)</label>
              <input 
                type="number" 
                className="form-input"
                placeholder="Enter registration fee amount"
                value={budgetForm.registration_fee}
                onChange={(e) => setBudgetForm({...budgetForm, registration_fee: e.target.value})}
              />
            </div>
          )}
          
          <div className="form-group">
            <label className="form-label">Total Event Budget (₹)</label>
            <input 
              type="number" 
              className="form-input"
              placeholder="Enter total budget for the event"
              value={budgetForm.total_budget}
              onChange={(e) => setBudgetForm({...budgetForm, total_budget: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Comments</label>
            <textarea 
              className="form-input"
              placeholder="Add your comments..."
              rows="3"
              value={budgetForm.comments}
              onChange={(e) => setBudgetForm({...budgetForm, comments: e.target.value})}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button 
              className="btn btn-success"
              onClick={() => handleApproval(true)}
              style={{ flex: 1 }}
            >
              Approve & Send to Gen Sec
            </button>
            <button 
              className="btn btn-danger"
              onClick={() => handleApproval(false)}
              style={{ flex: 1 }}
            >
              Reject Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderApproved = () => (
    <div className="fade-in">
      <div className="nav-header">
        <h3 className="nav-title">Approved Events</h3>
        <button 
          onClick={handleBackToOverview}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#00E5FF', 
            fontSize: '0.85rem', 
            cursor: 'pointer',
            padding: '0.25rem 0',
            pointerEvents: 'auto',
            zIndex: 10,
            position: 'relative'
          }}
        >
          ← Back to Overview
        </button>
      </div>
      <div className="table-container" style={{
        background: 'rgba(28, 26, 46, 0.85)',
        borderRadius: '18px',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <table className="table" style={{
          width: '100%',
          borderCollapse: 'collapse',
          background: 'transparent'
        }}>
          <thead style={{
            background: 'rgba(15, 14, 34, 0.8)'
          }}>
            <tr>
              <th style={{
                padding: '1rem',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: '#B8B6D8'
              }}>Event</th>
              <th style={{
                padding: '1rem',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: '#B8B6D8'
              }}>Type</th>
              <th style={{
                padding: '1rem',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: '#B8B6D8'
              }}>Date</th>
              <th style={{
                padding: '1rem',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: '#B8B6D8'
              }}>Participants</th>
              <th style={{
                padding: '1rem',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: '#B8B6D8'
              }}>Prize Pool</th>
              <th style={{
                padding: '1rem',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: '#B8B6D8'
              }}>Registration Fee</th>
              <th style={{
                padding: '1rem',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: '#B8B6D8'
              }}>Total Budget</th>
              <th style={{
                padding: '1rem',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: '#B8B6D8'
              }}>Status</th>
              <th style={{
                padding: '1rem',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: '#B8B6D8'
              }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.filter(e => ['TREASURER_APPROVED', 'GENSEC_APPROVED', 'CHAIRPERSON_APPROVED', 'PUBLISHED'].includes(e.status)).map(event => (
              <tr key={event._id}>
                <td style={{ padding: '1rem', color: '#F5F7FF' }}>{event.title}</td>
                <td style={{ padding: '1rem', color: '#F5F7FF' }}>{event.type}</td>
                <td style={{ padding: '1rem', color: '#F5F7FF' }}>{new Date(event.date).toLocaleDateString()}</td>
                <td style={{ padding: '1rem', color: '#F5F7FF' }}>{event.expected_participants}</td>
                <td style={{ padding: '1rem', color: '#F5F7FF' }}>₹{event.prize_pool || 0}</td>
                <td style={{ padding: '1rem', color: '#F5F7FF' }}>₹{event.registration_fee || 0}</td>
                <td style={{ padding: '1rem', color: '#F5F7FF' }}>₹{event.total_budget || 'Not set'}</td>
                <td style={{ padding: '1rem' }}>
                  <span className={`status-badge ${
                    event.status === 'PUBLISHED' ? 'status-published' : 
                    event.status === 'TREASURER_APPROVED' ? 'status-pending' : 'status-approved'
                  }`}>
                    {event.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => {
                      setSelectedEvent(event);
                      setActiveView('viewDetails');
                    }}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', marginRight: '0.5rem' }}
                  >
                    View Details
                  </button>
                  {event.status === 'PUBLISHED' && (
                    <button 
                      className="btn btn-primary" 
                      onClick={() => setSelectedEventForParticipants(event)}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                    >
                      Participants
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderViewDetails = () => (
    <div className="fade-in">
      <div className="nav-header">
        <h3 className="nav-title">Event Details - {selectedEvent?.title}</h3>
        <button 
          onClick={() => setActiveView('approved')}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#00E5FF', 
            fontSize: '0.85rem', 
            cursor: 'pointer',
            padding: '0.25rem 0',
            pointerEvents: 'auto',
            zIndex: 10,
            position: 'relative'
          }}
        >
          ← Back to Approved Events
        </button>
      </div>
      
      {selectedEvent?.cover_photo && (
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <img 
            src={`\${API_BASE_URL}/${selectedEvent.cover_photo}`} 
            alt="Event Cover" 
            style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '18px', objectFit: 'cover' }}
          />
        </div>
      )}
      
      <div className="card-grid">
        <div className="card">
          <h3 className="card-title">Event Information</h3>
          <div className="card-content">
            <p><strong>Title:</strong> {selectedEvent?.title}</p>
            <p><strong>Type:</strong> {selectedEvent?.type}</p>
            <p><strong>Date:</strong> {new Date(selectedEvent?.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> {selectedEvent?.time}</p>
            <p><strong>Duration:</strong> {selectedEvent?.duration_hours} hours</p>
            <p><strong>Expected Participants:</strong> {selectedEvent?.expected_participants}</p>
            <p><strong>Description:</strong> {selectedEvent?.description}</p>
          </div>
        </div>
        
        <div className="card">
          <h3 className="card-title">Budget Details</h3>
          <div className="card-content">
            <p><strong>Prize Pool:</strong> ₹{selectedEvent?.prize_pool || 0}</p>
            <p><strong>Registration Fee:</strong> ₹{selectedEvent?.registration_fee || 0}</p>
            <p><strong>Total Budget:</strong> ₹{selectedEvent?.total_budget || 'Not set'}</p>
            <p><strong>Status:</strong> <span className={`status-badge ${
              selectedEvent?.status === 'PUBLISHED' ? 'status-published' : 
              selectedEvent?.status === 'TREASURER_APPROVED' ? 'status-pending' : 'status-approved'
            }`}>{selectedEvent?.status.replace(/_/g, ' ')}</span></p>
          </div>
        </div>
        
        <div className="card">
          <h3 className="card-title">Requirements</h3>
          <div className="card-content">
            <p><strong>Volunteers:</strong> {selectedEvent?.requirements?.volunteers_needed || 0}</p>
            
            <div style={{ marginTop: '1rem' }}>
              <p><strong>Refreshments:</strong> {selectedEvent?.requirements?.refreshments_needed ? 'Yes' : 'No'}</p>
              {selectedEvent?.requirements?.refreshments_needed && selectedEvent?.requirements?.refreshment_items?.length > 0 && (
                <div style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                  <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Refreshment Items:</p>
                  {selectedEvent.requirements.refreshment_items.map((item, index) => (
                    <p key={index} style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0.2rem 0' }}>
                      • {item.item_name}: {item.quantity}
                    </p>
                  ))}
                </div>
              )}
            </div>
            
            <div style={{ marginTop: '1rem' }}>
              <p><strong>Stationery:</strong> {selectedEvent?.requirements?.stationary_needed ? 'Yes' : 'No'}</p>
              {selectedEvent?.requirements?.stationary_needed && selectedEvent?.requirements?.stationary_items?.length > 0 && (
                <div style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                  <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Stationery Items:</p>
                  {selectedEvent.requirements.stationary_items.map((item, index) => (
                    <p key={index} style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0.2rem 0' }}>
                      • {item.item_name}: {item.quantity}
                    </p>
                  ))}
                </div>
              )}
            </div>
            
            <div style={{ marginTop: '1rem' }}>
              <p><strong>Technical Equipment:</strong> {selectedEvent?.requirements?.technical_needed ? 'Yes' : 'No'}</p>
              {selectedEvent?.requirements?.technical_needed && selectedEvent?.requirements?.technical_items?.length > 0 && (
                <div style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                  <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Technical Items:</p>
                  {selectedEvent.requirements.technical_items.map((item, index) => (
                    <p key={index} style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0.2rem 0' }}>
                      • {item.item_name}: {item.quantity}
                    </p>
                  ))}
                </div>
              )}
            </div>
            
            <div style={{ marginTop: '1rem' }}>
              <p><strong>Goodies:</strong> {selectedEvent?.requirements?.goodies_needed ? 'Yes' : 'No'}</p>
              <p><strong>Physical Certificates:</strong> {selectedEvent?.requirements?.physical_certificate ? 'Yes' : 'No'}</p>
              <p><strong>Trophies:</strong> {selectedEvent?.requirements?.trophies_needed ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <h3 className="card-title">Venue Allocation</h3>
          <div className="card-content">
            {selectedEvent?.hospitality?.venue_allocated ? (
              <div>
                <p><strong>Status:</strong> <span style={{ color: '#4CAF50' }}>Allocated</span></p>
                {selectedEvent.hospitality.allocated_rooms?.length > 0 && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <p><strong>Allocated Rooms:</strong></p>
                    {selectedEvent.hospitality.allocated_rooms.map((room, idx) => (
                      <p key={idx} style={{ marginLeft: '1rem', fontSize: '0.9rem' }}>
                        • {room.room_number} - {room.room_name}
                      </p>
                    ))}
                  </div>
                )}
                {selectedEvent.hospitality.lab_allocated && (
                  <p><strong>Lab:</strong> {selectedEvent.hospitality.lab_allocated}</p>
                )}
                <p><strong>Complete Venue:</strong> {selectedEvent.hospitality.venue_details}</p>
              </div>
            ) : (
              <p><strong>Status:</strong> <span style={{ color: '#FF9800' }}>Pending Allocation</span></p>
            )}
          </div>
        </div>
        
        <div className="card">
          <h3 className="card-title">Volunteer Allocation</h3>
          <div className="card-content">
            {selectedEvent?.hr?.volunteers_allocated ? (
              <div>
                <p><strong>Status:</strong> <span style={{ color: '#4CAF50' }}>Allocated</span></p>
                {selectedEvent.hr.allocated_volunteers?.length > 0 && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <p><strong>Allocated Volunteers:</strong></p>
                    {selectedEvent.hr.allocated_volunteers.map((vol, idx) => (
                      <div key={idx} style={{ marginLeft: '1rem', fontSize: '0.9rem', marginBottom: '0.5rem', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                        <div>• <strong>{vol.volunteer_name}</strong> - {vol.volunteer_role}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          {vol.volunteer_contact} | {vol.volunteer_department}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {selectedEvent.hr.allocated_judges?.length > 0 && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <p><strong>Allocated Judges:</strong></p>
                    {selectedEvent.hr.allocated_judges.map((judge, idx) => (
                      <div key={idx} style={{ marginLeft: '1rem', fontSize: '0.9rem', marginBottom: '0.5rem', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                        <div>• <strong>{judge.judge_name}</strong> - {judge.judge_expertise}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          {judge.judge_contact} | {judge.judge_designation}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p><strong>Status:</strong> <span style={{ color: '#FF9800' }}>Pending Allocation</span></p>
            )}
          </div>
        </div>
      </div>
      
      {selectedEvent?.comments && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <h3 className="card-title">Treasurer Comments</h3>
          <div className="card-content">
            <p>{selectedEvent.comments}</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderPaymentVerification = () => (
    <div className="fade-in">
      <div className="nav-header">
        <h3 className="nav-title">Payment Verification</h3>
        <button 
          onClick={handleBackToOverview}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#00E5FF', 
            fontSize: '0.85rem', 
            cursor: 'pointer',
            padding: '0.25rem 0',
            pointerEvents: 'auto',
            zIndex: 10,
            position: 'relative'
          }}
        >
          ← Back to Overview
        </button>
      </div>

      {registrations.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
            No Pending Verifications
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>
            All payments have been verified
          </p>
        </div>
      ) : (
        <div className="card-grid">
          {registrations.map((reg) => (
            <div key={reg._id} className="card">
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {reg.event_id?.title}
              </h3>
              
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <strong>Participant:</strong> {reg.participant_name}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <strong>Email:</strong> {reg.participant_email}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <strong>Amount:</strong> ₹{reg.registration_fee}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <strong>Payment ID:</strong> 
                  <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                    {reg.payment_id}
                  </span>
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <strong>Payment Date:</strong> {new Date(reg.payment_date).toLocaleString()}
                </p>
              </div>

              {reg.payment_screenshot && (
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ color: 'var(--text-primary)', fontWeight: '600', marginBottom: '0.5rem' }}>
                    Payment Screenshot:
                  </p>
                  <img 
                    src={`\${API_BASE_URL}/${reg.payment_screenshot}`}
                    alt="Payment Screenshot"
                    style={{ 
                      width: '100%', 
                      maxHeight: '300px', 
                      objectFit: 'contain', 
                      borderRadius: '8px',
                      background: '#000',
                      cursor: 'pointer'
                    }}
                    onClick={() => window.open(`\${API_BASE_URL}/${reg.payment_screenshot}`, '_blank')}
                  />
                </div>
              )}

              {selectedReg === reg._id ? (
                <div>
                  <textarea
                    placeholder="Add comments (optional)"
                    value={verificationComments}
                    onChange={(e) => setVerificationComments(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      marginBottom: '1rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-soft)',
                      background: 'var(--bg-main)',
                      color: 'var(--text-primary)',
                      minHeight: '80px',
                      resize: 'vertical'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn btn-success"
                      onClick={() => handleVerifyPayment(reg._id, true)}
                      disabled={processing}
                      style={{ flex: 1 }}
                    >
                      {processing ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleVerifyPayment(reg._id, false)}
                      disabled={processing}
                      style={{ flex: 1 }}
                    >
                      Reject
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setSelectedReg(null);
                        setVerificationComments('');
                      }}
                      disabled={processing}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className="btn-primary"
                  onClick={() => setSelectedReg(reg._id)}
                  style={{ width: '100%' }}
                >
                  Verify Payment
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderVerificationHistory = () => (
    <div className="fade-in">
      <div className="nav-header">
        <h3 className="nav-title">Verification History</h3>
        <button 
          onClick={handleBackToOverview}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#00E5FF', 
            fontSize: '0.85rem', 
            cursor: 'pointer',
            padding: '0.25rem 0',
            pointerEvents: 'auto',
            zIndex: 10,
            position: 'relative'
          }}
        >
          ← Back to Overview
        </button>
      </div>

      {verificationHistory.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
            No Verification History
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>
            No payments have been verified yet
          </p>
        </div>
      ) : (
        <div className="table-container" style={{
          background: 'rgba(28, 26, 46, 0.85)',
          borderRadius: '18px',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.08)'
        }}>
          <table className="table" style={{
            width: '100%',
            borderCollapse: 'collapse',
            background: 'transparent'
          }}>
            <thead style={{
              background: 'rgba(15, 14, 34, 0.8)'
            }}>
              <tr>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: '#B8B6D8'
                }}>Event</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: '#B8B6D8'
                }}>Participant</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: '#B8B6D8'
                }}>Amount</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: '#B8B6D8'
                }}>Payment ID</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: '#B8B6D8'
                }}>Payment Date</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: '#B8B6D8'
                }}>Status</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: '#B8B6D8'
                }}>Comments</th>
              </tr>
            </thead>
            <tbody>
              {verificationHistory.map((reg) => (
                <tr key={reg._id}>
                  <td style={{ padding: '1rem', color: '#F5F7FF' }}>{reg.event_id?.title}</td>
                  <td style={{ padding: '1rem', color: '#F5F7FF' }}>
                    <div>
                      <div>{reg.participant_name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#B8B6D8' }}>{reg.participant_email}</div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: '#F5F7FF' }}>₹{reg.registration_fee}</td>
                  <td style={{ padding: '1rem', color: '#F5F7FF', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    {reg.payment_id || 'N/A'}
                  </td>
                  <td style={{ padding: '1rem', color: '#F5F7FF' }}>
                    {reg.payment_date ? new Date(reg.payment_date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`status-badge ${
                      reg.verification_status === 'APPROVED' ? 'status-approved' : 
                      reg.verification_status === 'REJECTED' ? 'status-rejected' : 'status-pending'
                    }`}>
                      {reg.verification_status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: '#F5F7FF', fontSize: '0.85rem' }}>
                    {reg.verification_comments || 'No comments'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderOnsitePayments = () => (
    <div className="fade-in">
      <div className="nav-header">
        <h3 className="nav-title">Onsite Payment Confirmation</h3>
        <button 
          onClick={handleBackToOverview}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#00E5FF', 
            fontSize: '0.85rem', 
            cursor: 'pointer',
            padding: '0.25rem 0',
            pointerEvents: 'auto',
            zIndex: 10,
            position: 'relative'
          }}
        >
          ← Back to Overview
        </button>
      </div>

      {onsiteRegistrations.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
            No Pending Onsite Payments
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>
            All onsite registrations have been processed
          </p>
        </div>
      ) : (
        <div className="card-grid">
          {onsiteRegistrations.map((reg) => (
            <div key={reg._id} className="card" style={{
              background: 'linear-gradient(135deg, rgba(28, 26, 46, 0.95), rgba(15, 14, 34, 0.9))',
              border: '1px solid rgba(0, 229, 255, 0.2)',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '1.5rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #00E5FF, #0091EA)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '1rem',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: '#fff'
                }}>
                  {reg.participant_details.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ 
                    fontSize: '1.3rem', 
                    margin: '0 0 0.25rem 0', 
                    color: '#00E5FF',
                    fontWeight: '600'
                  }}>
                    {reg.participant_details.name}
                  </h3>
                  <p style={{ 
                    margin: '0', 
                    color: 'rgba(255, 255, 255, 0.7)', 
                    fontSize: '0.9rem' 
                  }}>
                    Onsite Registration
                  </p>
                </div>
              </div>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '1rem', 
                marginBottom: '1.5rem' 
              }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <h4 style={{ 
                    color: '#00E5FF', 
                    fontSize: '0.9rem', 
                    margin: '0 0 0.75rem 0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontWeight: '600'
                  }}>Contact Details</h4>
                  <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                    <p style={{ margin: '0 0 0.5rem 0', color: '#F5F7FF' }}>
                      <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Email:</span><br/>
                      {reg.participant_details.email}
                    </p>
                    <p style={{ margin: '0 0 0.5rem 0', color: '#F5F7FF' }}>
                      <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Phone:</span><br/>
                      {reg.participant_details.phone}
                    </p>
                    <p style={{ margin: '0', color: '#F5F7FF' }}>
                      <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>College:</span><br/>
                      {reg.participant_details.college}
                    </p>
                  </div>
                </div>
                
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <h4 style={{ 
                    color: '#00E5FF', 
                    fontSize: '0.9rem', 
                    margin: '0 0 0.75rem 0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontWeight: '600'
                  }}>Registration Info</h4>
                  <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                    <p style={{ margin: '0 0 0.5rem 0' }}>
                      <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Total Fee:</span><br/>
                      <span style={{ 
                        color: '#4CAF50', 
                        fontSize: '1.1rem', 
                        fontWeight: '600' 
                      }}>₹{reg.total_fee}</span>
                    </p>
                    <p style={{ margin: '0 0 0.5rem 0', color: '#F5F7FF' }}>
                      <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Registered By:</span><br/>
                      {reg.registered_by?.name || 'Techops Team'}
                    </p>
                    <p style={{ margin: '0', color: '#F5F7FF' }}>
                      <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Date:</span><br/>
                      {new Date(reg.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ 
                  color: '#00E5FF', 
                  fontSize: '1rem', 
                  margin: '0 0 1rem 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontWeight: '600'
                }}>Registered Events</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {reg.events.map((event, idx) => (
                    <div key={idx} style={{ 
                      background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.1), rgba(0, 145, 234, 0.1))',
                      padding: '1rem', 
                      borderRadius: '10px',
                      border: '1px solid rgba(0, 229, 255, 0.2)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <p style={{ 
                          fontSize: '1rem', 
                          margin: '0',
                          color: '#F5F7FF',
                          fontWeight: '600'
                        }}>
                          {event.event_title}
                        </p>
                      </div>
                      <div style={{
                        background: 'rgba(76, 175, 80, 0.2)',
                        color: '#4CAF50',
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        border: '1px solid rgba(76, 175, 80, 0.3)'
                      }}>
                        ₹{event.registration_fee}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOnsiteReg === reg._id ? (
                <div>
                  <textarea
                    placeholder="Add comments (optional)"
                    value={onsiteComments}
                    onChange={(e) => setOnsiteComments(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      marginBottom: '1rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-soft)',
                      background: 'var(--bg-main)',
                      color: 'var(--text-primary)',
                      minHeight: '80px',
                      resize: 'vertical'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn btn-success"
                      onClick={() => handleConfirmOnsitePayment(reg._id, true)}
                      disabled={processingOnsite}
                      style={{ flex: 1 }}
                    >
                      {processingOnsite ? 'Processing...' : 'Confirm Payment'}
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleConfirmOnsitePayment(reg._id, false)}
                      disabled={processingOnsite}
                      style={{ flex: 1 }}
                    >
                      Reject
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setSelectedOnsiteReg(null);
                        setOnsiteComments('');
                      }}
                      disabled={processingOnsite}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className="btn-primary"
                  onClick={() => setSelectedOnsiteReg(reg._id)}
                  style={{ 
                    width: '100%', 
                    padding: '1rem 2rem', 
                    fontSize: '1.1rem', 
                    fontWeight: '600',
                    borderRadius: '12px'
                  }}
                >
                  Review Payment
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderOnsiteHistory = () => (
    <div className="fade-in">
      <div className="nav-header">
        <h3 className="nav-title">Onsite Payment History</h3>
        <button 
          onClick={handleBackToOverview}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#00E5FF', 
            fontSize: '0.85rem', 
            cursor: 'pointer',
            padding: '0.25rem 0',
            pointerEvents: 'auto',
            zIndex: 10,
            position: 'relative'
          }}
        >
          ← Back to Overview
        </button>
      </div>

      {allOnsiteRegistrations.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
            No Onsite Registrations
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>
            No onsite registrations found
          </p>
        </div>
      ) : (
        <div className="table-container" style={{
          background: 'rgba(28, 26, 46, 0.85)',
          borderRadius: '18px',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.08)'
        }}>
          <table className="table" style={{
            width: '100%',
            borderCollapse: 'collapse',
            background: 'transparent'
          }}>
            <thead style={{
              background: 'rgba(15, 14, 34, 0.8)'
            }}>
              <tr>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: '#B8B6D8'
                }}>Participant</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: '#B8B6D8'
                }}>Contact</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: '#B8B6D8'
                }}>Events</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: '#B8B6D8'
                }}>Total Fee</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: '#B8B6D8'
                }}>Status</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: '#B8B6D8'
                }}>Confirmed By</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: '#B8B6D8'
                }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {allOnsiteRegistrations.map((reg) => (
                <tr key={reg._id}>
                  <td style={{ padding: '1rem', color: '#F5F7FF' }}>
                    <div>
                      <div style={{ fontWeight: '600' }}>{reg.participant_details.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#B8B6D8' }}>{reg.participant_details.college}</div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: '#F5F7FF', fontSize: '0.9rem' }}>
                    <div>{reg.participant_details.email}</div>
                    <div>{reg.participant_details.phone}</div>
                  </td>
                  <td style={{ padding: '1rem', color: '#F5F7FF', fontSize: '0.9rem' }}>
                    {reg.events.map((event, idx) => (
                      <div key={idx}>{event.event_title} (₹{event.registration_fee})</div>
                    ))}
                  </td>
                  <td style={{ padding: '1rem', color: '#F5F7FF', fontWeight: '600' }}>₹{reg.total_fee}</td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`status-badge ${
                      reg.status === 'PAYMENT_CONFIRMED' ? 'status-approved' : 
                      reg.status === 'REJECTED' ? 'status-rejected' : 'status-pending'
                    }`}>
                      {reg.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: '#F5F7FF', fontSize: '0.9rem' }}>
                    {reg.payment_confirmed_by?.name || 'N/A'}
                  </td>
                  <td style={{ padding: '1rem', color: '#F5F7FF', fontSize: '0.9rem' }}>
                    {new Date(reg.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderIncomeManager = () => (
    <div className="fade-in">
      <div className="nav-header">
        <h3 className="nav-title">Income Manager</h3>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            className="btn btn-secondary"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              exportToCSV(incomeAnalytics?.eventWiseDetails || [], 'income-report');
            }}
            style={{ 
              padding: '0.5rem 1rem', 
              fontSize: '0.8rem', 
              cursor: 'pointer',
              border: '1px solid var(--accent-cyan)',
              background: 'transparent',
              color: 'var(--accent-cyan)',
              borderRadius: '999px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(0, 229, 255, 0.1)';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Export CSV
          </button>
          <button 
            className="btn btn-secondary"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              exportToPDFSimple(incomeAnalytics?.eventWiseDetails || [], 'Income Report', 'income');
            }}
            style={{ 
              padding: '0.5rem 1rem', 
              fontSize: '0.8rem', 
              cursor: 'pointer',
              border: '1px solid var(--accent-cyan)',
              background: 'transparent',
              color: 'var(--accent-cyan)',
              borderRadius: '999px',
              transition: 'all 0.3s ease',
              pointerEvents: 'auto',
              position: 'relative',
              zIndex: 1
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(0, 229, 255, 0.1)';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Export PDF
          </button>
          <button 
            onClick={handleBackToOverview}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#00E5FF', 
              fontSize: '0.85rem', 
              cursor: 'pointer',
              padding: '0.25rem 0',
              pointerEvents: 'auto',
              zIndex: 10,
              position: 'relative'
            }}
          >
            ← Back to Overview
          </button>
        </div>
      </div>

      {loadingFinancial ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Loading Income Analytics...</h3>
        </div>
      ) : incomeAnalytics ? (
        <div id="income-data">
          {/* Charts Section */}
          {chartData && (
            <div className="card-grid" style={{ marginBottom: '2rem' }}>
              <div className="card">
                <h3 className="card-title">Income vs Expense Overview</h3>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                  <SimpleChart 
                    type="bar"
                    data={chartData.incomeVsExpense}
                    title="Financial Overview"
                  />
                </div>
              </div>
              <div className="card">
                <h3 className="card-title">Online vs Onsite Income</h3>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                  <SimpleChart 
                    type="pie"
                    data={chartData.incomeBreakdown}
                    title="Income Sources"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Income Summary Cards */}
          <div className="card-grid" style={{ marginBottom: '2rem' }}>
            <div className="card" style={{ background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(69, 160, 73, 0.1))', border: '1px solid rgba(76, 175, 80, 0.3)' }}>
              <h3 className="card-title" style={{ color: '#4CAF50', fontSize: '1.1rem' }}>Total Income</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#4CAF50', marginBottom: '0.5rem' }}>
                ₹{incomeAnalytics.totalIncome.toLocaleString()}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                From {incomeAnalytics.totalRegistrations} registrations
              </p>
            </div>
            
            <div className="card" style={{ background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.1), rgba(0, 180, 216, 0.1))', border: '1px solid rgba(0, 229, 255, 0.3)' }}>
              <h3 className="card-title" style={{ color: '#00E5FF', fontSize: '1.1rem' }}>Online Income</h3>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#00E5FF', marginBottom: '0.5rem' }}>
                ₹{incomeAnalytics.onlineIncome.toLocaleString()}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {incomeAnalytics.analytics.onlinePercentage.toFixed(1)}% of total ({incomeAnalytics.onlineRegistrations} registrations)
              </p>
            </div>
            
            <div className="card" style={{ background: 'linear-gradient(135deg, rgba(245, 179, 1, 0.1), rgba(255, 140, 0, 0.1))', border: '1px solid rgba(245, 179, 1, 0.3)' }}>
              <h3 className="card-title" style={{ color: 'var(--accent-gold)', fontSize: '1.1rem' }}>Onsite Income</h3>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--accent-gold)', marginBottom: '0.5rem' }}>
                ₹{incomeAnalytics.onsiteIncome.toLocaleString()}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {incomeAnalytics.analytics.onsitePercentage.toFixed(1)}% of total ({incomeAnalytics.onsiteRegistrations} registrations)
              </p>
            </div>
          </div>

          {/* Event-wise Income Table */}
          <div className="table-container" style={{
            background: 'rgba(28, 26, 46, 0.85)',
            borderRadius: '18px',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.08)',
            marginBottom: '2rem'
          }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-soft)' }}>
              <h3 style={{ color: 'var(--text-primary)', margin: '0', fontSize: '1.3rem' }}>Event-wise Income Breakdown</h3>
            </div>
            <table className="table" style={{
              width: '100%',
              borderCollapse: 'collapse',
              background: 'transparent'
            }}>
              <thead style={{
                background: 'rgba(15, 14, 34, 0.8)'
              }}>
                <tr>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: '#B8B6D8'
                  }}>Event</th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: '#B8B6D8'
                  }}>Type</th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: '#B8B6D8'
                  }}>Total Income</th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: '#B8B6D8'
                  }}>Online</th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: '#B8B6D8'
                  }}>Onsite</th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: '#B8B6D8'
                  }}>Registrations</th>
                </tr>
              </thead>
              <tbody>
                {incomeAnalytics.eventWiseDetails.map(event => (
                  <tr key={event.eventId}>
                    <td style={{ padding: '1rem', color: '#F5F7FF' }}>
                      <div>
                        <div style={{ fontWeight: '600' }}>{event.eventTitle}</div>
                        <div style={{ fontSize: '0.8rem', color: '#B8B6D8' }}>
                          {event.eventDate ? new Date(event.eventDate).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: '#F5F7FF' }}>{event.eventType}</td>
                    <td style={{ padding: '1rem', color: '#4CAF50', fontWeight: '600' }}>₹{event.totalIncome.toLocaleString()}</td>
                    <td style={{ padding: '1rem', color: '#00E5FF' }}>₹{event.onlineIncome.toLocaleString()}</td>
                    <td style={{ padding: '1rem', color: 'var(--accent-gold)' }}>₹{event.onsiteIncome.toLocaleString()}</td>
                    <td style={{ padding: '1rem', color: '#F5F7FF' }}>
                      {event.totalRegistrations} ({event.onlineRegistrations}O + {event.onsiteRegistrations}S)
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>No Income Data Available</h3>
          <p style={{ color: 'var(--text-muted)' }}>No completed registrations found</p>
        </div>
      )}
    </div>
  );

  const renderExpenseManager = () => (
    <div className="fade-in">
      <div className="nav-header" style={{ position: 'relative', zIndex: 1 }}>
        <h3 className="nav-title">Expense Manager</h3>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', position: 'relative', zIndex: 2 }}>
          <button 
            className="btn btn-secondary"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              exportToCSV(expenseAnalytics?.eventWiseDetails || [], 'expense-report');
            }}
            style={{ 
              padding: '0.5rem 1rem', 
              fontSize: '0.8rem', 
              cursor: 'pointer',
              border: '1px solid var(--accent-cyan)',
              background: 'transparent',
              color: 'var(--accent-cyan)',
              borderRadius: '999px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(0, 229, 255, 0.1)';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Export CSV
          </button>
          <button 
            className="btn btn-secondary"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              exportToPDFSimple(expenseAnalytics?.eventWiseDetails || [], 'Expense Report', 'expense');
            }}
            style={{ 
              padding: '0.5rem 1rem', 
              fontSize: '0.8rem', 
              cursor: 'pointer',
              border: '1px solid var(--accent-cyan)',
              background: 'transparent',
              color: 'var(--accent-cyan)',
              borderRadius: '999px',
              transition: 'all 0.3s ease',
              pointerEvents: 'auto',
              position: 'relative',
              zIndex: 1
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(0, 229, 255, 0.1)';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Export PDF
          </button>
          <button 
            onClick={handleBackToOverview}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#00E5FF', 
              fontSize: '0.85rem', 
              cursor: 'pointer',
              padding: '0.25rem 0',
              pointerEvents: 'auto',
              zIndex: 10,
              position: 'relative'
            }}
          >
            ← Back to Overview
          </button>
        </div>
      </div>

      {loadingFinancial ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Loading Expense Analytics...</h3>
        </div>
      ) : expenseAnalytics ? (
        <div id="expense-data">
          {/* Charts Section */}
          {chartData && (
            <div className="card" style={{ marginBottom: '2rem' }}>
              <h3 className="card-title">Expense Breakdown Chart</h3>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                <SimpleChart 
                  type="pie"
                  data={chartData.expenseBreakdown}
                  title="Category-wise Expenses"
                />
              </div>
            </div>
          )}

          {/* Expense Summary Cards */}
          <div className="card-grid" style={{ marginBottom: '2rem' }}>
            <div className="card" style={{ background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(238, 90, 82, 0.1))', border: '1px solid rgba(255, 107, 107, 0.3)' }}>
              <h3 className="card-title" style={{ color: '#FF6B6B', fontSize: '1.1rem' }}>Total Expenses</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#FF6B6B', marginBottom: '0.5rem' }}>
                ₹{expenseAnalytics.totalExpenses.toLocaleString()}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Across {expenseAnalytics.totalEventsWithExpenses} events
              </p>
            </div>
            
            <div className="card" style={{ background: 'linear-gradient(135deg, rgba(156, 163, 175, 0.1), rgba(107, 114, 128, 0.1))', border: '1px solid rgba(156, 163, 175, 0.3)' }}>
              <h3 className="card-title" style={{ color: '#9CA3AF', fontSize: '1.1rem' }}>Average per Event</h3>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#9CA3AF', marginBottom: '0.5rem' }}>
                ₹{expenseAnalytics.analytics.averageExpensePerEvent.toLocaleString()}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Per event average
              </p>
            </div>
            
            <div className="card" style={{ background: 'linear-gradient(135deg, rgba(245, 179, 1, 0.1), rgba(255, 140, 0, 0.1))', border: '1px solid rgba(245, 179, 1, 0.3)' }}>
              <h3 className="card-title" style={{ color: 'var(--accent-gold)', fontSize: '1.1rem' }}>Top Category</h3>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent-gold)', marginBottom: '0.5rem' }}>
                {expenseAnalytics.categoryAnalytics[0]?.category || 'N/A'}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                ₹{expenseAnalytics.categoryAnalytics[0]?.amount.toLocaleString() || '0'} ({expenseAnalytics.categoryAnalytics[0]?.percentage.toFixed(1) || '0'}%)
              </p>
            </div>
          </div>

          {/* Category-wise Expenses */}
          <div className="card" style={{ marginBottom: '2rem', maxWidth: '100%', boxSizing: 'border-box' }}>
            <h3 className="card-title">Category-wise Expense Breakdown</h3>
            <div className="card-content" style={{ maxWidth: '100%', boxSizing: 'border-box' }}>
              {expenseAnalytics.categoryAnalytics.map((category, index) => (
                <div key={category.category} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.5rem 0.75rem',
                  marginBottom: '0.5rem',
                  background: `linear-gradient(135deg, rgba(255, 107, 107, ${0.1 - index * 0.02}), rgba(238, 90, 82, ${0.1 - index * 0.02}))`,
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 107, 107, 0.2)',
                  maxWidth: '100%',
                  boxSizing: 'border-box'
                }}>
                  <div style={{ flex: 1, minWidth: 0, marginRight: '1rem' }}>
                    <div style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.95rem' }}>
                      {category.category}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {category.percentage.toFixed(1)}%
                    </div>
                  </div>
                  <div style={{ color: '#FF6B6B', fontWeight: '700', fontSize: '1.1rem', flexShrink: 0 }}>
                    ₹{category.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Event-wise Expenses Table */}
          <div className="table-container" style={{
            background: 'rgba(28, 26, 46, 0.85)',
            borderRadius: '18px',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.08)'
          }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-soft)' }}>
              <h3 style={{ color: 'var(--text-primary)', margin: '0', fontSize: '1.3rem' }}>Event-wise Expense Details</h3>
            </div>
            <table className="table" style={{
              width: '100%',
              borderCollapse: 'collapse',
              background: 'transparent'
            }}>
              <thead style={{
                background: 'rgba(15, 14, 34, 0.8)'
              }}>
                <tr>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: '#B8B6D8'
                  }}>Event</th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: '#B8B6D8'
                  }}>Type</th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: '#B8B6D8'
                  }}>Total Expense</th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: '#B8B6D8'
                  }}>Submitted</th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: '#B8B6D8'
                  }}>Bill</th>
                </tr>
              </thead>
              <tbody>
                {expenseAnalytics.eventWiseDetails.map(event => (
                  <tr key={event.eventId}>
                    <td style={{ padding: '1rem', color: '#F5F7FF' }}>
                      <div>
                        <div style={{ fontWeight: '600' }}>{event.eventTitle}</div>
                        <div style={{ fontSize: '0.8rem', color: '#B8B6D8' }}>
                          {event.eventDate ? new Date(event.eventDate).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: '#F5F7FF' }}>{event.eventType}</td>
                    <td style={{ padding: '1rem', color: '#FF6B6B', fontWeight: '600' }}>₹{event.totalExpense.toLocaleString()}</td>
                    <td style={{ padding: '1rem', color: '#F5F7FF' }}>
                      {event.submittedAt ? new Date(event.submittedAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {event.hasBillAttachment ? (
                        <span style={{ color: '#4CAF50', fontSize: '0.9rem' }}>Attached</span>
                      ) : (
                        <span style={{ color: '#FF6B6B', fontSize: '0.9rem' }}>Missing</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>No Expense Data Available</h3>
          <p style={{ color: 'var(--text-muted)' }}>No expenses have been submitted by logistics team</p>
        </div>
      )}
    </div>
  );

  const renderBudgetVariance = () => (
    <div className="fade-in">
      <div className="nav-header">
        <h3 className="nav-title">Budget Variance Alerts</h3>
        <button 
          onClick={handleBackToOverview}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#00E5FF', 
            fontSize: '0.85rem', 
            cursor: 'pointer',
            padding: '0.25rem 0',
            pointerEvents: 'auto',
            zIndex: 10,
            position: 'relative'
          }}
        >
          ← Back to Overview
        </button>
      </div>

      {loadingFinancial ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Loading Budget Variance...</h3>
        </div>
      ) : budgetVariance ? (
        <>
          {/* Alert Summary */}
          <div className="card-grid" style={{ marginBottom: '2rem' }}>
            <div className="card" style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1))', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <h3 className="card-title" style={{ color: '#EF4444', fontSize: '1.1rem' }}>Critical Alerts</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#EF4444', marginBottom: '0.5rem' }}>
                {budgetVariance.alerts.critical.length}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Events >20% over budget</p>
            </div>
            
            <div className="card" style={{ background: 'linear-gradient(135deg, rgba(245, 101, 101, 0.1), rgba(239, 68, 68, 0.1))', border: '1px solid rgba(245, 101, 101, 0.3)' }}>
              <h3 className="card-title" style={{ color: '#F56565', fontSize: '1.1rem' }}>High Alerts</h3>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#F56565', marginBottom: '0.5rem' }}>
                {budgetVariance.alerts.high.length}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Events 10-20% over budget</p>
            </div>
            
            <div className="card" style={{ background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.1))', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
              <h3 className="card-title" style={{ color: '#FBBF24', fontSize: '1.1rem' }}>Medium Alerts</h3>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#FBBF24', marginBottom: '0.5rem' }}>
                {budgetVariance.alerts.medium.length}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Events less than 10% over budget</p>
            </div>
          </div>

          {/* Critical Alerts */}
          {budgetVariance.alerts.critical.length > 0 && (
            <div className="card" style={{ marginBottom: '2rem', border: '2px solid #EF4444' }}>
              <h3 className="card-title" style={{ color: '#EF4444' }}>Critical Budget Overruns</h3>
              <div className="card-content">
                {budgetVariance.alerts.critical.map(event => (
                  <div key={event.eventId} style={{
                    padding: '1rem',
                    marginBottom: '1rem',
                    background: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(239, 68, 68, 0.3)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>{event.eventTitle}</h4>
                        <p style={{ color: '#EF4444', margin: '0', fontWeight: '600' }}>{event.alertMessage}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: '#EF4444', fontWeight: '700', fontSize: '1.2rem' }}>
                          ₹{Math.abs(event.variance).toLocaleString()} over
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                          Budget: ₹{event.plannedBudget.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Variance Data */}
          <div className="table-container" style={{
            background: 'rgba(28, 26, 46, 0.85)',
            borderRadius: '18px',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.08)'
          }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-soft)' }}>
              <h3 style={{ color: 'var(--text-primary)', margin: '0', fontSize: '1.3rem' }}>Budget vs Actual Analysis</h3>
            </div>
            <table className="table" style={{
              width: '100%',
              borderCollapse: 'collapse',
              background: 'transparent'
            }}>
              <thead style={{
                background: 'rgba(15, 14, 34, 0.8)'
              }}>
                <tr>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: '#B8B6D8'
                  }}>Event</th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: '#B8B6D8'
                  }}>Planned Budget</th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: '#B8B6D8'
                  }}>Actual Expense</th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: '#B8B6D8'
                  }}>Variance</th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: '#B8B6D8'
                  }}>Alert Level</th>
                </tr>
              </thead>
              <tbody>
                {budgetVariance.data.map(event => (
                  <tr key={event.eventId}>
                    <td style={{ padding: '1rem', color: '#F5F7FF' }}>
                      <div>
                        <div style={{ fontWeight: '600' }}>{event.eventTitle}</div>
                        <div style={{ fontSize: '0.8rem', color: '#B8B6D8' }}>
                          {event.eventDate ? new Date(event.eventDate).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: '#4CAF50', fontWeight: '600' }}>₹{event.plannedBudget.toLocaleString()}</td>
                    <td style={{ padding: '1rem', color: '#FF6B6B', fontWeight: '600' }}>₹{event.actualExpense.toLocaleString()}</td>
                    <td style={{ padding: '1rem', fontWeight: '600', color: event.variance >= 0 ? '#4CAF50' : '#FF6B6B' }}>
                      {event.variance >= 0 ? '+' : ''}₹{event.variance.toLocaleString()}
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        ({event.variancePercentage.toFixed(1)}%)
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {event.alertLevel !== 'none' ? (
                        <span className={`status-badge ${
                          event.alertLevel === 'critical' ? 'status-rejected' :
                          event.alertLevel === 'high' ? 'status-rejected' :
                          event.alertLevel === 'medium' ? 'status-pending' : 'status-approved'
                        }`}>
                          {event.alertLevel.toUpperCase()}
                        </span>
                      ) : (
                        <span style={{ color: '#4CAF50', fontSize: '0.9rem' }}>On Budget</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>No Budget Variance Data</h3>
          <p style={{ color: 'var(--text-muted)' }}>No events with both budget and expense data found</p>
        </div>
      )}
    </div>
  );

  // Simple Chart Component (without external library)
  const SimpleChart = ({ type, data, title }) => {
    if (type === 'pie' && data) {
      const total = data.data.reduce((sum, val) => sum + val, 0);
      const colors = ['#4CAF50', '#00E5FF', '#FF6B6B', '#F5B301', '#9C27B0'];
      
      return (
        <div style={{ textAlign: 'center', width: '100%', padding: '1rem' }}>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', fontSize: '1rem' }}>{title}</h4>
          
          {/* Visual Bar Chart */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginBottom: '1.5rem',
            gap: '0.5rem',
            maxWidth: '100%',
            overflow: 'hidden'
          }}>
            {data.labels.map((label, index) => {
              const value = data.data[index];
              const percentage = total > 0 ? ((value / total) * 100) : 0;
              return (
                <div key={label} style={{
                  flex: `${percentage} 1 0`,
                  minWidth: '80px',
                  height: '120px',
                  background: colors[index % colors.length],
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  padding: '0.5rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{percentage.toFixed(1)}%</div>
                  <div style={{ fontSize: '0.75rem', textAlign: 'center', wordBreak: 'break-word' }}>{label}</div>
                </div>
              );
            })}
          </div>
          
          {/* Data List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {data.labels.map((label, index) => {
              const value = data.data[index];
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
              return (
                <div key={label} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.5rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: colors[index % colors.length]
                    }}></div>
                    <span style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>{label}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.9rem' }}>₹{value.toLocaleString()}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    
    if (type === 'bar' && data) {
      const maxValue = Math.max(...data.data);
      return (
        <div style={{ textAlign: 'center' }}>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>{title}</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {data.labels.map((label, index) => {
              const value = data.data[index];
              const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
              return (
                <div key={label} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '100px' }}>
                    <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{label}</span>
                  </div>
                  <div style={{ flex: 1, margin: '0 1rem', position: 'relative' }}>
                    <div style={{
                      width: '100%',
                      height: '20px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${percentage}%`,
                        height: '100%',
                        background: ['#4CAF50', '#FF6B6B', '#00E5FF'][index % 3],
                        borderRadius: '10px',
                        transition: 'width 0.3s ease'
                      }}></div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: '100px' }}>
                    <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>₹{value.toLocaleString()}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    
    return <div>Chart not available</div>;
  };

  const renderChangePrice = () => {
    const publishedEvents = events.filter(e => e.status === 'PUBLISHED' && !e.event_finished);
    return (
      <div className="fade-in">
        <div className="nav-header">
          <h3 className="nav-title">Change Event Price</h3>
          <button 
            onClick={handleBackToOverview}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#00E5FF', 
              fontSize: '0.85rem', 
              cursor: 'pointer',
              padding: '0.25rem 0',
              pointerEvents: 'auto',
              zIndex: 10,
              position: 'relative'
            }}
          >
            ← Back to Overview
          </button>
        </div>
        {publishedEvents.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <h3 style={{ color: 'var(--text-primary)' }}>No Published Events</h3>
            <p style={{ color: 'var(--text-muted)' }}>No active published events to update pricing</p>
          </div>
        ) : (
          <div className="table-container" style={{ background: 'rgba(28, 26, 46, 0.85)', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', background: 'transparent' }}>
              <thead style={{ background: 'rgba(15, 14, 34, 0.8)' }}>
                <tr>
                  {['Event', 'Type', 'Date', 'Current Fee', 'Registration Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#B8B6D8' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {publishedEvents.map(event => (
                  <tr key={event._id}>
                    <td style={{ padding: '1rem', color: '#F5F7FF' }}>{event.title}</td>
                    <td style={{ padding: '1rem', color: '#F5F7FF' }}>{event.type}</td>
                    <td style={{ padding: '1rem', color: '#F5F7FF' }}>{new Date(event.date).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem', color: event.registration_fee > 0 ? '#4CAF50' : '#FF9800', fontWeight: '600' }}>
                      {event.registration_fee > 0 ? `₹${event.registration_fee}` : 'Free'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`status-badge ${event.registration_status === 'OPEN' ? 'status-approved' : event.registration_status === 'PAUSED' ? 'status-pending' : 'status-rejected'}`}>
                        {event.registration_status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button className="btn btn-primary" onClick={() => { setPriceEvent(event); setNewPrice(event.registration_fee || ''); }} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Change Price</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {priceEvent && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => setPriceEvent(null)}>
            <div className="card" style={{ minWidth: '400px', maxWidth: '500px', padding: '2rem' }} onClick={e => e.stopPropagation()}>
              <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>Update Price - {priceEvent.title}</h3>
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Current Fee: <strong style={{ color: priceEvent.registration_fee > 0 ? '#4CAF50' : '#FF9800' }}>{priceEvent.registration_fee > 0 ? `₹${priceEvent.registration_fee}` : 'Free'}</strong></p>
              </div>
              <div className="form-group">
                <label className="form-label">New Registration Fee (₹)</label>
                <input type="number" className="form-input" min="0" placeholder="Enter new fee (0 for free)" value={newPrice} onChange={e => setNewPrice(e.target.value)} />
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>Set to 0 to make the event free.</p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn btn-success" onClick={handleUpdatePrice} disabled={priceUpdating} style={{ flex: 1 }}>{priceUpdating ? 'Updating...' : 'Update Price'}</button>
                <button className="btn btn-secondary" onClick={() => setPriceEvent(null)} style={{ flex: 1 }}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {activeView === 'overview' && renderOverview()}
      {activeView === 'pending' && renderPending()}
      {activeView === 'approved' && renderApproved()}
      {activeView === 'details' && renderEventDetails()}
      {activeView === 'viewDetails' && renderViewDetails()}
      {activeView === 'paymentVerification' && renderPaymentVerification()}
      {activeView === 'verificationHistory' && renderVerificationHistory()}
      {activeView === 'expenses' && renderExpenses()}
      {activeView === 'onsitePayments' && renderOnsitePayments()}
      {activeView === 'onsiteHistory' && renderOnsiteHistory()}
      {activeView === 'incomeManager' && renderIncomeManager()}
      {activeView === 'expenseManager' && renderExpenseManager()}
      {activeView === 'budgetVariance' && renderBudgetVariance()}
      {activeView === 'changePrice' && renderChangePrice()}
      {selectedEventForParticipants && (
        <ParticipantsModal 
          event={selectedEventForParticipants} 
          onClose={() => setSelectedEventForParticipants(null)} 
        />
      )}
    </div>
  );

  function renderExpenses() {
    return (
      <div className="fade-in">
        <div className="nav-header">
          <h3 className="nav-title">Event Expenses</h3>
          <button 
            onClick={handleBackToOverview}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#00E5FF', 
              fontSize: '0.85rem', 
              cursor: 'pointer',
              padding: '0.25rem 0',
              pointerEvents: 'auto',
              zIndex: 10,
              position: 'relative'
            }}
          >
            ← Back to Overview
          </button>
        </div>

        {expenseEvents.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
              No Expense Data
            </h3>
            <p style={{ color: 'var(--text-muted)' }}>
              No expenses have been submitted by logistics team yet
            </p>
          </div>
        ) : (
          <div className="events-grid">
            {expenseEvents.map(event => (
              <div key={event._id} className="card">
                <div className="card-header">
                  <h4 className="card-title">{event.title}</h4>
                  <div className="event-meta">
                    <span className="event-type">{event.type}</span>
                    <span className="event-date">{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="card-content">
                  <div className="expense-summary">
                    <p><strong>Total Expense:</strong> ₹{event.logistics?.total_expense || 0}</p>
                    <p><strong>Status:</strong> 
                      <span className={`status-badge ${
                        event.logistics?.expense_submitted ? 'status-approved' : 'status-pending'
                      }`}>
                        {event.logistics?.expense_submitted ? 'Submitted' : 'Pending'}
                      </span>
                    </p>
                    {event.logistics?.expense_submitted_at && (
                      <p><strong>Submitted:</strong> {new Date(event.logistics.expense_submitted_at).toLocaleDateString()}</p>
                    )}
                  </div>
                  
                  {event.logistics?.expense_breakdown && (
                    <div className="expense-breakdown">
                      <h5 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>Expense Breakdown:</h5>
                      {Object.entries(event.logistics.expense_breakdown).map(([category, amount]) => (
                        amount > 0 && (
                          <div key={category} className="expense-item">
                            <span>{category.charAt(0).toUpperCase() + category.slice(1)}:</span>
                            <span>₹{amount}</span>
                          </div>
                        )
                      ))}
                    </div>
                  )}
                  
                  {/* GST Information Display - Only show when there's a specific reason for no GST */}
                  {event.logistics?.expense_submitted && !event.logistics?.gst_verified && event.logistics?.no_gst_reason && event.logistics.no_gst_reason.trim() !== '' && (
                    <div className="gst-info" style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                      <h5 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>GST Information:</h5>
                      <div>
                        <div style={{ color: '#fbbf24', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                          <strong>No GST Number</strong>
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                          <strong>Reason:</strong> {event.logistics.no_gst_reason}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {event.logistics?.bill_attachment && (
                    <div style={{ marginTop: '1rem' }}>
                      <button 
                        className="btn btn-secondary"
                        onClick={() => window.open(`\${API_BASE_URL}/${event.logistics.bill_attachment}`, '_blank')}
                        style={{ width: '100%' }}
                      >
                        View Bill Attachment
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}