import React, { useMemo, useState, useRef, useEffect } from "react";

const EngagementChart = ({
  petitionsData = [],
  pollsData = [],
  width = 800,
  height = 300,
  className = "",
  labels = [],
  onDataFetch,
  loading = false,
}) => {
  // Make chart responsive
  const [chartDimensions, setChartDimensions] = useState({ width: 800, height: 300 });
  
  useEffect(() => {
    const updateDimensions = () => {
      const containerWidth = Math.min(window.innerWidth - 48, 800); // Account for padding
      setChartDimensions({
        width: containerWidth,
        height: Math.max(250, containerWidth * 0.4) // Maintain aspect ratio
      });
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);
  const [isTouch, setIsTouch] = useState(false);
  // Auto-refresh data every 30 seconds
  useEffect(() => {
    if (onDataFetch) {
      const interval = setInterval(() => {
        onDataFetch();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [onDataFetch]);

  // Detect touch devices
  useEffect(() => {
    const checkTouch = () => {
      setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  const { petitionsPath, pollsPath, petitionsArea, pollsArea, maxValue, minValue, dataPoints } = useMemo(() => {
    // Handle empty data gracefully
    const safePetitionsData = Array.isArray(petitionsData) ? petitionsData : [];
    const safePollsData = Array.isArray(pollsData) ? pollsData : [];
    
    if (safePetitionsData.length === 0 && safePollsData.length === 0) {
      return { petitionsPath: "", pollsPath: "", petitionsArea: "", pollsArea: "", maxValue: 0, minValue: 0, dataPoints: [] };
    }

    const allData = [...safePetitionsData, ...safePollsData];
    const maxValue = Math.max(...allData);
    const minValue = Math.min(...allData);
    // Ensure minimum range for better visualization
    const range = Math.max(maxValue - minValue, 1);
    
    const padding = 30;
    const chartWidth = chartDimensions.width - padding * 2;
    const chartHeight = chartDimensions.height - padding * 2;
    
    const normalize = (value) => {
      return chartHeight - ((value - minValue) / range) * chartHeight;
    };

    const createPath = (data) => {
      if (data.length === 0) return "";
      const stepX = chartWidth / Math.max(1, data.length - 1);
      const points = data.map((value, index) => [
        padding + index * stepX,
        padding + normalize(value)
      ]);
      
      return points.map((point, index) => 
        index === 0 ? `M ${point[0]},${point[1]}` : `L ${point[0]},${point[1]}`
      ).join(" ");
    };

    const createArea = (data) => {
      if (data.length === 0) return "";
      const stepX = chartWidth / Math.max(1, data.length - 1);
      const points = data.map((value, index) => [
        padding + index * stepX,
        padding + normalize(value)
      ]);
      
      const areaPath = points.map((point, index) => 
        index === 0 ? `M ${point[0]},${point[1]}` : `L ${point[0]},${point[1]}`
      ).join(" ");
      
      return `${areaPath} L ${padding + chartWidth},${padding + chartHeight} L ${padding},${padding + chartHeight} Z`;
    };

    // Create data points for interaction
    const stepX = chartWidth / Math.max(1, safePetitionsData.length - 1);
    const dataPoints = safePetitionsData.map((petitionValue, index) => ({
      x: padding + index * stepX,
      y: padding + normalize(petitionValue),
      petitions: petitionValue,
      polls: safePollsData[index] || 0,
      label: labels[index] || `Day ${index + 1}`,
      index
    }));

    return {
      petitionsPath: createPath(safePetitionsData),
      pollsPath: createPath(safePollsData),
      petitionsArea: createArea(safePetitionsData),
      pollsArea: createArea(safePollsData),
      maxValue,
      minValue,
      dataPoints
    };
  }, [petitionsData, pollsData, width, height, labels]);

  const handleMouseMove = (event) => {
    if (!svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Find closest data point
    const closestPoint = dataPoints.reduce((closest, point) => {
      const distance = Math.abs(point.x - x);
      const closestDistance = Math.abs(closest.x - x);
      return distance < closestDistance ? point : closest;
    });
    
    setHoveredPoint(closestPoint);
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  const handleTouchMove = (event) => {
    if (!isTouch || !svgRef.current) return;
    event.preventDefault();
    
    const touch = event.touches[0];
    const rect = svgRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    // Find closest data point
    const closestPoint = dataPoints.reduce((closest, point) => {
      const distance = Math.abs(point.x - x);
      const closestDistance = Math.abs(closest.x - x);
      return distance < closestDistance ? point : closest;
    });
    
    setHoveredPoint(closestPoint);
    setTooltipPosition({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = () => {
    // Keep tooltip visible for a moment on touch devices
    setTimeout(() => setHoveredPoint(null), 2000);
  };

  // Show loading state if no data
  if (loading && (!petitionsData || petitionsData.length === 0) && (!pollsData || pollsData.length === 0)) {
    return (
      <div className={`bg-white shadow rounded-lg p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E84C3D] mx-auto mb-4"></div>
            <p className="text-gray-500">Loading engagement data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white shadow rounded-lg p-3 sm:p-6 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-[#2D3E50]">
            Community Engagement
      </h3>
          <p className="text-sm text-gray-500 mt-1">
            See how active your community is with petitions and polls
          </p>
        </div>
        {loading && (
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#E84C3D]"></div>
            <span>Updating...</span>
          </div>
        )}
      </div>
      
      {/* Modern Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl border border-red-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-red-600 uppercase tracking-wide">Total Petitions</p>
              <p className="text-3xl font-bold text-red-700 mt-1">
                {petitionsData.reduce((a, b) => a + b, 0)}
              </p>
              <p className="text-xs text-red-500 mt-1">Community requests</p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Total Polls</p>
              <p className="text-3xl font-bold text-blue-700 mt-1">
                {pollsData.reduce((a, b) => a + b, 0)}
              </p>
              <p className="text-xs text-blue-500 mt-1">Community votes</p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modern Legend */}
      <div className="flex items-center justify-center space-x-8 mb-6">
        <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-full shadow-md border">
          <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-sm"></div>
          <span className="text-sm font-semibold text-gray-700">Petitions</span>
        </div>
        <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-full shadow-md border">
          <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-sm"></div>
          <span className="text-sm font-semibold text-gray-700">Polls</span>
        </div>
      </div>
      
      {/* Modern Chart Container */}
      <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 shadow-xl border border-gray-200">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-2xl"></div>
        
        <svg
          ref={svgRef}
          width={chartDimensions.width}
          height={chartDimensions.height}
          className="w-full h-auto cursor-crosshair touch-none relative z-10"
          viewBox={`0 0 ${chartDimensions.width} ${chartDimensions.height}`}
          role="img"
          aria-label="Engagement trends chart"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: 'none' }}
        >
          {/* Modern Gradients and Patterns */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
            </pattern>
            
            {/* Modern Petitions Gradient */}
            <linearGradient id="petitionsGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(239,68,68,0.4)" />
              <stop offset="50%" stopColor="rgba(239,68,68,0.2)" />
              <stop offset="100%" stopColor="rgba(239,68,68,0.05)" />
            </linearGradient>
            
            {/* Modern Polls Gradient */}
            <linearGradient id="pollsGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(59,130,246,0.4)" />
              <stop offset="50%" stopColor="rgba(59,130,246,0.2)" />
              <stop offset="100%" stopColor="rgba(59,130,246,0.05)" />
            </linearGradient>
            
            {/* Glow Effects */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Modern Y-axis labels */}
          {(() => {
            const padding = 30;
            const chartHeight = chartDimensions.height - padding * 2;
            return [0, 1, 2, 3, 4, 5].map((value) => {
              const y = padding + (chartHeight - (value / 5) * chartHeight);
              return (
                <g key={value}>
                  <line x1={padding - 8} y1={y} x2={padding - 2} y2={y} stroke="#d1d5db" strokeWidth="1" opacity="0.6"/>
                  <text x={padding - 12} y={y + 5} textAnchor="end" fontSize="11" fill="#6b7280" fontWeight="500">
                    {value}
                  </text>
                </g>
              );
            });
          })()}
          
          {/* Modern X-axis labels - Hide on mobile devices */}
          {(() => {
            const padding = 30;
            const chartWidth = chartDimensions.width - padding * 2;
            const safeLabels = Array.isArray(labels) && labels.length > 0 ? labels : [];
            const step = Math.max(1, Math.floor(safeLabels.length / 8)); // Show max 8 labels
            
            // Hide labels on mobile devices (screen width < 768px)
            const isMobile = chartDimensions.width < 768;
            
            if (isMobile) {
              return null; // Don't render labels on mobile
            }
            
            return safeLabels
              .filter((_, index) => index % step === 0 || index === safeLabels.length - 1)
              .map((label, filteredIndex) => {
                const originalIndex = safeLabels.indexOf(label);
                const x = padding + (originalIndex * (chartWidth / Math.max(1, safeLabels.length - 1)));
                return (
                  <text 
                    key={originalIndex}
                    x={x} 
                    y={chartDimensions.height - 15} 
                    textAnchor="middle" 
                    fontSize="10" 
                    fill="#6b7280"
                    fontWeight="500"
                  >
                    {(() => {
                      try {
                        if (typeof label === 'string') {
                          // If it's already a formatted string, use it
                          if (label.includes('Mon') || label.includes('Tue') || label.includes('Wed') || label.includes('Thu') || label.includes('Fri') || label.includes('Sat') || label.includes('Sun')) {
                            return label;
                          }
                          // Try to parse as date
                          const date = new Date(label);
                          if (!isNaN(date.getTime())) {
                            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                          }
                          return label;
                        }
                        return 'Invalid Date';
                      } catch (e) {
                        return label || 'Invalid Date';
                      }
                    })()}
                  </text>
                );
              });
          })()}
          
          {/* Petitions area */}
          {petitionsArea && (
            <path
              d={petitionsArea}
              fill="url(#petitionsGradient)"
            />
          )}
          
          {/* Polls area */}
          {pollsArea && (
            <path
              d={pollsArea}
              fill="url(#pollsGradient)"
            />
          )}
          
          {/* Modern Petitions line with glow */}
          {petitionsPath && (
            <g>
              <path
                d={petitionsPath}
                fill="none"
                stroke="url(#petitionsGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#glow)"
                opacity="0.8"
              />
            <path
              d={petitionsPath}
              fill="none"
                stroke="#ef4444"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            </g>
          )}
          
          {/* Modern Polls line with glow */}
          {pollsPath && (
            <g>
              <path
                d={pollsPath}
                fill="none"
                stroke="url(#pollsGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#glow)"
                opacity="0.8"
              />
            <path
              d={pollsPath}
              fill="none"
                stroke="#3b82f6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            </g>
          )}

          {/* Modern Interactive data points */}
          {dataPoints.map((point, index) => (
            <g key={index}>
              {/* Glow effect */}
              <circle
                cx={point.x}
                cy={point.y}
                r="8"
                fill="#ef4444"
                opacity="0.3"
                className="opacity-0 hover:opacity-100 transition-opacity duration-300"
              />
              {/* Main point */}
              <circle
                cx={point.x}
                cy={point.y}
                r="5"
                fill="#ef4444"
                stroke="white"
                strokeWidth="2"
                className="opacity-0 hover:opacity-100 transition-all duration-300 hover:scale-125"
                filter="url(#glow)"
              />
            </g>
          ))}
        </svg>

        {/* Compact Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute bg-white/95 backdrop-blur-sm border border-gray-200 text-gray-800 px-3 py-2 rounded-lg shadow-lg text-xs pointer-events-none z-20"
            style={{
              left: Math.min(Math.max(tooltipPosition.x - 10, 10), chartDimensions.width - 120),
              top: Math.max(tooltipPosition.y - 10, 10),
              background: 'rgba(255,255,255,0.95)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
          >
            {/* Hide date label on mobile devices */}
            {chartDimensions.width >= 768 && (
              <div className="font-semibold text-sm mb-2 text-gray-800 text-center">
                {(() => {
                  try {
                    // Handle different label formats
                    if (typeof hoveredPoint.label === 'string') {
                      // If it's already a formatted string, use it
                      if (hoveredPoint.label.includes('Mon') || hoveredPoint.label.includes('Tue')) {
                        return hoveredPoint.label;
                      }
                      // Try to parse as date
                      const date = new Date(hoveredPoint.label);
                      if (!isNaN(date.getTime())) {
                        return date.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        });
                      }
                      return hoveredPoint.label;
                    }
                    return 'Invalid Date';
                  } catch (e) {
                    return hoveredPoint.label || 'Invalid Date';
                  }
                })()}
              </div>
            )}
            
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-xs font-medium text-gray-700">Petitions</span>
                </div>
                <span className="font-bold text-red-600 text-sm">
                  {hoveredPoint.petitions}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-xs font-medium text-gray-700">Polls</span>
                </div>
                <span className="font-bold text-blue-600 text-sm">
                  {hoveredPoint.polls}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Modern Help Section */}
      <div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 shadow-lg">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
            <span className="text-white text-lg">💡</span>
          </div>
          <div>
            <h4 className="font-bold text-gray-800 mb-3 text-lg">How to read this graph</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center space-x-3 bg-white/60 px-3 py-2 rounded-lg">
                <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Red line = Petitions created</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/60 px-3 py-2 rounded-lg">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Blue line = Polls created</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/60 px-3 py-2 rounded-lg">
                <span className="text-lg">📈</span>
                <span className="text-sm font-medium text-gray-700">Higher lines = More activity</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/60 px-3 py-2 rounded-lg">
                <span className="text-lg">🖱️</span>
                <span className="text-sm font-medium text-gray-700">Hover for exact numbers</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngagementChart;
