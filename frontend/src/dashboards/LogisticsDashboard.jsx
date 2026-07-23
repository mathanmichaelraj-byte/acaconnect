import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import Tesseract from 'tesseract.js';

export default function LogisticsDashboard() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [activeView, setActiveView] = useState('overview');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const backButtonRef = useRef(null);
  const [expenseData, setExpenseData] = useState({
    total_expense: 0,
    expense_breakdown: {
      refreshments: 0,
      stationery: 0,
      technical: 0,
      certificates: 0,
      goodies: 0,
      trophies: 0,
      other: 0
    },
    bill_attachment: null,
    gst_number: '',
    gst_verified: false,
    no_gst_reason: ''
  });
  const [ocrStatus, setOcrStatus] = useState('idle');
  const [showNoGstReason, setShowNoGstReason] = useState(false);

  // Reset expense data when event changes
  useEffect(() => {
    if (selectedEvent) {
      // Check if event already has expense data
      if (selectedEvent.logistics?.expense_breakdown) {
        setExpenseData({
          total_expense: selectedEvent.logistics.total_expense || 0,
          expense_breakdown: selectedEvent.logistics.expense_breakdown,
          bill_attachment: null
        });
      } else {
        // Reset to empty form for new expense
        setExpenseData({
          total_expense: 0,
          expense_breakdown: {
            refreshments: 0,
            stationery: 0,
            technical: 0,
            certificates: 0,
            goodies: 0,
            trophies: 0,
            other: 0
          },
          bill_attachment: null,
          gst_number: '',
          gst_verified: false,
          no_gst_reason: ''
        });
      }
      setOcrStatus('idle');
      setShowNoGstReason(false);
    }
  }, [selectedEvent]);

  const handleBackToOverview = () => {
    setActiveView('overview');
    setSelectedEvent(null);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      console.log('Fetching logistics events...');
      const response = await axios.get('/logistics/events');
      console.log('Logistics events response:', response.data);
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      console.error('Error response:', error.response?.data);
    }
  };

  const handleAcknowledgeRequirements = async (eventId) => {
    try {
      await axios.post(`/logistics/acknowledge/${eventId}`);
      alert('Requirements acknowledged successfully!');
      // fetchEvents(); // Removed to prevent re-renders
    } catch (error) {
      alert('Failed to acknowledge requirements: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const handleDeleteExpense = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this expense submission? This action cannot be undone.')) {
      try {
        await axios.delete(`/logistics/expense/${eventId}`);
        alert('Expense deleted successfully!');
        fetchEvents();
      } catch (error) {
        alert('Failed to delete expense: ' + (error.response?.data?.message || 'Unknown error'));
      }
    }
  };

  const processOCR = async (file) => {
    if (!file) return;
    
    // Only process images, skip PDFs to avoid complexity
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      // For non-image files, show manual GST option
      setOcrStatus('idle');
      setShowNoGstReason(true);
      setExpenseData(prev => ({
        ...prev,
        gst_number: '',
        gst_verified: false
      }));
      return;
    }
    
    setOcrStatus('processing');
    try {
      const result = await Tesseract.recognize(file, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        tessedit_pageseg_mode: Tesseract.PSM.AUTO
      });
      
      const text = result.data.text.toUpperCase().replace(/\s+/g, ' ');
      console.log('OCR Text:', text);
      
      // Multiple GST patterns to catch variations
      const gstPatterns = [
        // Standard GST format (15 chars)
        /\b\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}\b/g,
        // Relaxed format (14-15 chars) - handles incomplete GST numbers
        /\b\d{2}[A-Z]{5}\d{4}[A-Z\d]{1,3}\b/g,
        // With spaces or separators
        /\b\d{2}\s*[A-Z]{5}\s*\d{4}\s*[A-Z\d]{1,3}\b/g,
        // GSTIN: prefix
        /GSTIN[:\s-]*\d{2}[A-Z]{5}\d{4}[A-Z\d]{1,3}/g,
        // GST NO: prefix
        /GST\s*NO[:\s-]*\d{2}[A-Z]{5}\d{4}[A-Z\d]{1,3}/g
      ];
      
      let gstNumber = null;
      
      for (const pattern of gstPatterns) {
        const matches = text.match(pattern);
        if (matches && matches.length > 0) {
          // Clean the match to get just the GST number
          let cleanMatch = matches[0].replace(/[^0-9A-Z]/g, '');
          // Remove common prefixes
          cleanMatch = cleanMatch.replace(/^(GSTIN|GSTNO|GST)/, '');
          
          if (cleanMatch.length >= 12 && cleanMatch.length <= 15) {
            gstNumber = cleanMatch;
            break;
          }
        }
      }
      
      if (gstNumber && gstNumber.length >= 12) {
        setExpenseData(prev => ({
          ...prev,
          gst_number: gstNumber,
          gst_verified: true
        }));
        setOcrStatus('completed');
        setShowNoGstReason(false);
      } else {
        setExpenseData(prev => ({
          ...prev,
          gst_number: '',
          gst_verified: false
        }));
        setOcrStatus('completed');
        setShowNoGstReason(true);
      }
    } catch (error) {
      console.error('OCR Error:', error);
      setOcrStatus('error');
      setExpenseData(prev => ({
        ...prev,
        gst_number: '',
        gst_verified: false
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setExpenseData({ ...expenseData, bill_attachment: file });
    
    // Process OCR for all supported files
    if (file) {
      processOCR(file);
    } else {
      setOcrStatus('idle');
      setShowNoGstReason(false);
    }
  };

  const handleSubmitExpense = async (e) => {
    e.preventDefault();
    try {
      console.log('=== LOGISTICS EXPENSE SUBMISSION DEBUG ===');
      console.log('Selected Event ID:', selectedEvent._id);
      console.log('Expense Data State:', expenseData);
      console.log('GST Number from state:', expenseData.gst_number);
      console.log('GST Verified from state:', expenseData.gst_verified);
      console.log('No GST Reason from state:', expenseData.no_gst_reason);
      
      const formData = new FormData();
      formData.append('expense_breakdown', JSON.stringify(expenseData.expense_breakdown));
      formData.append('gst_number', expenseData.gst_number || '');
      formData.append('gst_verified', expenseData.gst_verified.toString());
      formData.append('no_gst_reason', expenseData.no_gst_reason || '');
      
      console.log('FormData values:');
      console.log('- expense_breakdown:', JSON.stringify(expenseData.expense_breakdown));
      console.log('- gst_number:', expenseData.gst_number || '');
      console.log('- gst_verified:', expenseData.gst_verified.toString());
      console.log('- no_gst_reason:', expenseData.no_gst_reason || '');
      
      if (expenseData.bill_attachment) {
        formData.append('bill_attachment', expenseData.bill_attachment);
      }

      console.log('Sending request to:', `/logistics/expense/${selectedEvent._id}`);
      
      const response = await axios.post(`/logistics/expense/${selectedEvent._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      
      if (response.status === 200) {
        alert('Expense submitted successfully!');
        setActiveView('overview');
        setSelectedEvent(null);
      } else {
        console.error('Unexpected response status:', response.status);
        alert('Expense submission may have failed. Please check with administrator.');
      }
      // fetchEvents(); // Removed to prevent re-renders
    } catch (error) {
      console.error('Error submitting expense:', error);
      alert('Failed to submit expense: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const renderOverview = () => (
    <div className="card-grid fade-in">
      <div className="card">
        <h3 className="card-title">Logistics Overview</h3>
        <div className="card-content">
          <p><strong>Total Events:</strong> {events.length}</p>
          <p><strong>Pending Acknowledgments:</strong> {events.filter(e => !e.logistics?.requirements_acknowledged).length}</p>
          <p><strong>Pending Expenses:</strong> {events.filter(e => e.logistics?.requirements_acknowledged && !e.logistics?.expense_submitted).length}</p>
          <p><strong>Submitted Expenses:</strong> {events.filter(e => e.logistics?.expense_submitted).length}</p>
        </div>
      </div>
      <div className="card">
        <h3 className="card-title">Actions</h3>
        <div className="card-content">
          <button className="btn btn-primary" onClick={() => setActiveView('requirements')} style={{ margin: '0.25rem', width: '100%' }}>
            View Requirements
          </button>
          <button className="btn btn-secondary" onClick={() => setActiveView('submitted')} style={{ margin: '0.25rem', width: '100%' }}>
            Submitted Expenses
          </button>
        </div>
      </div>
    </div>
  );

  const renderRequirements = () => (
    <div className="fade-in">
      <div className="nav-header">
        <h3 className="nav-title">Event Requirements</h3>
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
            zIndex: 999999,
            position: 'relative'
          }}
        >
          ← Back to Overview
        </button>
      </div>
      <div className="events-grid">
        {events.filter(event => !event.logistics?.expense_submitted).map(event => (
          <div key={event._id} className="card">
            <div className="card-header">
              <h4 className="card-title">{event.title}</h4>
              <div className="event-meta">
                <span className="event-type">{event.type}</span>
                <span className="event-date">{new Date(event.date).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="card-content">
              <div className="requirements-section">
                {event.requirements?.refreshment_items?.length > 0 && (
                  <div className="requirement-group">
                    <h5>Refreshments</h5>
                    {event.requirements.refreshment_items.map((item, idx) => (
                      <div key={idx} className="requirement-item">
                        <span>{item.item_name}</span>
                        <span className="quantity">{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {event.requirements?.stationary_items?.length > 0 && (
                  <div className="requirement-group">
                    <h5>Stationery</h5>
                    {event.requirements.stationary_items.map((item, idx) => (
                      <div key={idx} className="requirement-item">
                        <span>{item.item_name}</span>
                        <span className="quantity">{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {event.requirements?.technical_items?.length > 0 && (
                  <div className="requirement-group">
                    <h5>Technical Items</h5>
                    {event.requirements.technical_items.map((item, idx) => (
                      <div key={idx} className="requirement-item">
                        <span>{item.item_name}</span>
                        <span className="quantity">{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="requirement-group">
                  <h5>Other Requirements</h5>
                  {event.requirements?.physical_certificate && <div className="requirement-item">Physical Certificates</div>}
                  {event.requirements?.goodies_needed && <div className="requirement-item">Goodies</div>}
                  {event.requirements?.trophies_needed && <div className="requirement-item">Trophies</div>}
                </div>
              </div>
              
              <div className="card-actions">
                {!event.logistics?.requirements_acknowledged ? (
                  <button className="btn btn-success" onClick={() => handleAcknowledgeRequirements(event._id)}>
                    Acknowledge Requirements
                  </button>
                ) : !event.logistics?.expense_submitted ? (
                  <button className="btn btn-primary" onClick={() => { setSelectedEvent(event); setActiveView('expense'); }}>
                    Submit Expense
                  </button>
                ) : (
                  <div className="status-badge success">Completed</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderExpenseForm = () => (
    <div className="fade-in">
      <div className="nav-header">
        <h3 className="nav-title">Submit Expense - {selectedEvent?.title}</h3>
        <button onClick={() => setActiveView('requirements')} style={{ background: 'none', border: 'none', color: '#00E5FF', fontSize: '0.85rem', cursor: 'pointer' }}>← Back to Requirements</button>
      </div>
      <div className="card">
        <form onSubmit={handleSubmitExpense} className="form-container">
          <div className="form-section">
            <h4>Expense Breakdown</h4>
            <div className="form-grid">
              {Object.entries(expenseData.expense_breakdown).map(([category, amount]) => (
                <div key={category} className="form-group">
                  <label className="form-label">{category.charAt(0).toUpperCase() + category.slice(1)} (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={amount}
                    onChange={(e) => setExpenseData({
                      ...expenseData,
                      expense_breakdown: {
                        ...expenseData.expense_breakdown,
                        [category]: parseFloat(e.target.value) || 0
                      }
                    })}
                  />
                </div>
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Total Expense (₹)</label>
            <input
              type="number"
              className="form-input"
              value={Object.values(expenseData.expense_breakdown).reduce((sum, val) => sum + val, 0)}
              readOnly
              style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Bill Attachment</label>
            <input
              type="file"
              className="form-input"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
            />
            <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
              All formats supported. GST auto-detection works for JPG/PNG images only.
            </small>
            
            {/* OCR Status Display */}
            {ocrStatus === 'processing' && (
              <div style={{ marginTop: '0.5rem', color: 'var(--accent-gold)', fontSize: '0.85rem' }}>
                🔄 Scanning image for GST number...
              </div>
            )}
            
            {ocrStatus === 'completed' && expenseData.gst_verified && (
              <div style={{ marginTop: '0.5rem', color: '#4ade80', fontSize: '0.85rem' }}>
                ✅ GST Number Found: {expenseData.gst_number}
              </div>
            )}
            
            {ocrStatus === 'completed' && !expenseData.gst_verified && (
              <div style={{ marginTop: '0.5rem', color: '#fbbf24', fontSize: '0.85rem' }}>
                ⚠️ No GST number detected in image
              </div>
            )}
            
            {ocrStatus === 'error' && (
              <div style={{ marginTop: '0.5rem', color: '#ef4444', fontSize: '0.85rem' }}>
                ❌ Could not scan file (proceeding without GST validation)
              </div>
            )}
            
            {expenseData.bill_attachment && expenseData.bill_attachment.type === 'application/pdf' && (
              <div style={{ marginTop: '0.5rem', color: '#00E5FF', fontSize: '0.85rem' }}>
                📄 PDF uploaded - GST auto-detection not available for PDFs
              </div>
            )}
          </div>
          
          {/* No GST Reason Field */}
          {showNoGstReason && (
            <div className="form-group">
              <label className="form-label">Reason for No GST *</label>
              <textarea
                className="form-input"
                rows="3"
                placeholder="Please provide reason for submitting bill without GST (e.g., vendor not GST registered, emergency purchase, etc.)"
                value={expenseData.no_gst_reason}
                onChange={(e) => setExpenseData({ ...expenseData, no_gst_reason: e.target.value })}
                required={!expenseData.gst_verified}
                style={{ resize: 'vertical' }}
              />
            </div>
          )}
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Submit Expense
          </button>
        </form>
      </div>
    </div>
  );

  const renderSubmittedExpenses = () => (
    <div>
      <div className="nav-header">
        <h3 className="nav-title">Submitted Expenses</h3>
        <button 
          onClick={() => setActiveView('overview')}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#00E5FF', 
            fontSize: '0.85rem', 
            cursor: 'pointer',
            padding: '0.25rem 0',
            pointerEvents: 'auto',
            zIndex: 999999,
            position: 'relative'
          }}
        >
          ← Back to Overview
        </button>
      </div>
      <div className="events-grid">
        {events.filter(event => event.logistics?.expense_submitted).map(event => (
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
                <h5>Expense Summary</h5>
                <div className="expense-breakdown">
                  {Object.entries(event.logistics.expense_breakdown || {}).map(([category, amount]) => (
                    amount > 0 && (
                      <div key={category} className="expense-item">
                        <span>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                        <span className="amount">₹{amount}</span>
                      </div>
                    )
                  ))}
                </div>
                <div className="total-expense">
                  <strong>Total: ₹{event.logistics.total_expense}</strong>
                </div>
                <div className="submission-date">
                  <small>Submitted: {new Date(event.logistics.expense_submitted_at).toLocaleDateString()}</small>
                </div>
              </div>
              <div className="card-actions" style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <div className="status-badge success">Expense Submitted</div>
                <button 
                  className="btn btn-danger"
                  onClick={() => handleDeleteExpense(event._id)}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                >
                  Delete Expense
                </button>
              </div>
            </div>
          </div>
        ))}
        {events.filter(event => event.logistics?.expense_submitted).length === 0 && (
          <div className="card">
            <div className="card-content">
              <p>No expenses submitted yet.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      {activeView === 'overview' && renderOverview()}
      {activeView === 'requirements' && renderRequirements()}
      {activeView === 'expense' && renderExpenseForm()}
      {activeView === 'submitted' && renderSubmittedExpenses()}
    </div>
  );
}