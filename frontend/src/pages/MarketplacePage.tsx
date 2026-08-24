import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import './MarketplacePage.css';

interface Batch {
  _id: string;
  batchCode?: string;
  status?: string;
  nitrogen?: string | number;
  phosphorus?: string | number;
  potassium?: string | number;
  quantity?: string | number;
}

const MarketplacePage: React.FC = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    
    const loadBatches = async () => {
      try {
        setLoading(true);
        const data = await api.marketplace.getBatches();
        if (isMounted) {
          setBatches(data.batches || []);
          setError('');
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load marketplace batches');
          console.error(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadBatches();
    
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="marketplace-page">
      <div className="page-container">
        <h1>Marketplace</h1>
        <p>Browse certified organic slurry batches from biogas plants</p>
        
        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading batches...</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <span className="material-symbols-outlined">error</span>
            <p>{error}</p>
            <button onClick={() => {
              // Reload the page to retry
              window.location.reload();
            }} className="retry-btn">Retry</button>
          </div>
        )}

        {!loading && !error && (
          <div className="batches-grid">
            {batches.length === 0 ? (
              <div className="empty-state">
                <span className="material-symbols-outlined">inventory_2</span>
                <p>No batches available at the moment</p>
              </div>
            ) : (
              batches.map((batch) => (
                <div key={batch._id} className="batch-card">
                  <div className="batch-header">
                    <h3>{batch.batchCode || 'Unknown Batch'}</h3>
                    <span className={`batch-status ${batch.status === 'available' ? 'available' : 'unavailable'}`}>
                      {batch.status || 'Unknown'}
                    </span>
                  </div>
                  <div className="batch-details">
                    <div className="detail-item">
                      <span className="material-symbols-outlined">science</span>
                      <span>N: {batch.nitrogen || 'N/A'}%</span>
                    </div>
                    <div className="detail-item">
                      <span className="material-symbols-outlined">science</span>
                      <span>P: {batch.phosphorus || 'N/A'}%</span>
                    </div>
                    <div className="detail-item">
                      <span className="material-symbols-outlined">science</span>
                      <span>K: {batch.potassium || 'N/A'}%</span>
                    </div>
                    <div className="detail-item">
                      <span className="material-symbols-outlined">scale</span>
                      <span>{batch.quantity || 'N/A'} kg</span>
                    </div>
                  </div>
                  <button className="view-details-btn">View Details</button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketplacePage;