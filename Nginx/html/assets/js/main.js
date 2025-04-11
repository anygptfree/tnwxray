/**
 * CloudDev Platform - Main JavaScript
 * Version: 1.2.3
 * (c) 2025 CloudDev Inc.
 */

// Initialize the application
(function() {
    'use strict';
    
    // Configuration
    const config = {
        apiEndpoint: '/api/data/stream',
        refreshInterval: 30000,
        maxRetries: 5,
        debug: false
    };
    
    // Feature detection
    const supportsWebSocket = 'WebSocket' in window || 'MozWebSocket' in window;
    
    // DOM Elements
    let elements = {};
    
    // Initialize the application
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setup);
        } else {
            setup();
        }
        
        // Set up periodic data refresh
        setInterval(refreshData, config.refreshInterval);
        
        // Log initialization
        if (config.debug) {
            console.log('Application initialized');
        }
    }
    
    // Set up the application
    function setup() {
        // Cache DOM elements
        cacheElements();
        
        // Set up event listeners
        setupEventListeners();
        
        // Initial data load
        loadInitialData();
        
        // Check for WebSocket support
        if (supportsWebSocket) {
            setupWebSocket();
        }
    }
    
    // Cache DOM elements for better performance
    function cacheElements() {
        elements = {
            signupButton: document.querySelector('.btn'),
            features: document.querySelectorAll('.feature'),
            header: document.querySelector('header')
        };
    }
    
    // Set up event listeners
    function setupEventListeners() {
        if (elements.signupButton) {
            elements.signupButton.addEventListener('click', handleSignupClick);
        }
        
        // Add hover effects to features
        if (elements.features.length) {
            elements.features.forEach(feature => {
                feature.addEventListener('mouseenter', handleFeatureHover);
                feature.addEventListener('mouseleave', handleFeatureHoverEnd);
            });
        }
    }
    
    // Handle signup button click
    function handleSignupClick(e) {
        e.preventDefault();
        
        // Show signup modal or redirect to signup page
        console.log('Signup clicked');
        
        // Analytics tracking
        trackEvent('signup_click', {
            source: 'homepage',
            timestamp: new Date().toISOString()
        });
    }
    
    // Handle feature hover
    function handleFeatureHover(e) {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 8px 15px rgba(0,0,0,0.1)';
        e.currentTarget.style.transition = 'all 0.3s ease';
    }
    
    // Handle feature hover end
    function handleFeatureHoverEnd(e) {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
    }
    
    // Load initial data
    function loadInitialData() {
        fetch('/api/data/stream')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                processData(data);
            })
            .catch(error => {
                if (config.debug) {
                    console.error('Error fetching initial data:', error);
                }
                // Fallback to default data
                processData(getDefaultData());
            });
    }
    
    // Process the data
    function processData(data) {
        // Process and display data
        if (config.debug) {
            console.log('Data processed:', data);
        }
    }
    
    // Get default data as fallback
    function getDefaultData() {
        return {
            features: [
                { id: 1, name: 'Serverless Computing', popularity: 85 },
                { id: 2, name: 'Container Orchestration', popularity: 92 },
                { id: 3, name: 'Global CDN', popularity: 78 },
                { id: 4, name: 'Database Services', popularity: 88 },
                { id: 5, name: 'AI & Machine Learning', popularity: 95 },
                { id: 6, name: 'DevOps Tools', popularity: 82 }
            ],
            stats: {
                users: 125000,
                deployments: 3500000,
                uptime: 99.99
            }
        };
    }
    
    // Refresh data periodically
    function refreshData() {
        if (config.debug) {
            console.log('Refreshing data...');
        }
        
        // In a real application, this would fetch fresh data
        // For demo purposes, we'll just use the default data
        processData(getDefaultData());
    }
    
    // Set up WebSocket for real-time updates
    function setupWebSocket() {
        let retries = 0;
        let ws = null;
        
        function connect() {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${protocol}//${window.location.host}${config.apiEndpoint}`;
            
            ws = new WebSocket(wsUrl);
            
            ws.onopen = function() {
                if (config.debug) {
                    console.log('WebSocket connection established');
                }
                retries = 0;
            };
            
            ws.onmessage = function(event) {
                try {
                    const data = JSON.parse(event.data);
                    processData(data);
                } catch (e) {
                    if (config.debug) {
                        console.error('Error processing WebSocket message:', e);
                    }
                }
            };
            
            ws.onclose = function() {
                if (retries < config.maxRetries) {
                    retries++;
                    setTimeout(connect, 1000 * retries);
                    if (config.debug) {
                        console.log(`WebSocket reconnecting... Attempt ${retries}`);
                    }
                } else {
                    if (config.debug) {
                        console.log('WebSocket connection closed after max retries');
                    }
                }
            };
            
            ws.onerror = function(error) {
                if (config.debug) {
                    console.error('WebSocket error:', error);
                }
            };
        }
        
        connect();
    }
    
    // Analytics tracking
    function trackEvent(eventName, eventData) {
        if (window.gtag) {
            gtag('event', eventName, eventData);
        } else if (window.ga) {
            ga('send', 'event', 'user_interaction', eventName, JSON.stringify(eventData));
        }
    }
    
    // Initialize the application
    init();
})();
