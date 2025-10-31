/**
 * JavaScript for the admin bar pagination
 * 
 * Fixes cluttered admin toolbar issues
 * @package AdminBarPagination
 * @version 1.0.0
 */

(function() {
    'use strict';
    
    // Items that are always visible (logo and site name)
    const alwaysVisible = [
        '#wp-admin-bar-wp-logo',
        '#wp-admin-bar-site-name',
        '#wp-admin-bar-my-sites',
        '#wp-admin-bar-menu-toggle'
    ];
    
    const itemsPerPage = (typeof abpSettings !== 'undefined' && abpSettings.itemsPerPage) ? parseInt(abpSettings.itemsPerPage, 10) : 3;
    let currentPage = 0;
    let paginatableItems = [];
    
    function scanForMenuItems() {
        const toolbar = document.getElementById('wp-toolbar');
        if (!toolbar) return [];
        
        // Get ONLY the direct children of the main menu (parent items only)
        const mainMenu = document.getElementById('wp-admin-bar-root-default');
        if (!mainMenu) return [];
        
        // Get ONLY direct child li elements (parent menu items)
        const parentItems = Array.from(mainMenu.children).filter(item => 
            item.tagName === 'LI' && item.id
        );
        
        // Filter out always visible items, secondary menu items, and pagination itself
        return parentItems.filter(item => {
            const itemId = '#' + item.id;
            return !alwaysVisible.includes(itemId) && 
                   !item.closest('#wp-admin-bar-top-secondary') &&
                   itemId !== '#wp-admin-bar-pagination';
        }).map(item => '#' + item.id);
    }
    
    function createPaginationControls() {
        const toolbar = document.getElementById('wp-toolbar');
        if (!toolbar) return;
        
        // Check if pagination already exists
        if (document.getElementById('wp-admin-bar-pagination')) return;
        
        // First scan for items to see if we need pagination
        paginatableItems = scanForMenuItems();
        
        // If we have 3 items or fewer, don't create pagination at all
        if (paginatableItems.length <= itemsPerPage) {
            return;
        }
        
        // Reset to first page when creating new pagination
        currentPage = 0;
        
        // Create pagination container with clean structure
        const paginationLi = document.createElement('li');
        paginationLi.id = 'wp-admin-bar-pagination';
        paginationLi.className = 'wp-admin-bar-pagination';
        paginationLi.innerHTML = `
            <button id="prev-page" title="Previous page" disabled>‹</button>
            <span class="page-indicator">1/1</span>
            <button id="next-page" title="Next page">›</button>
        `;
        
        // Insert pagination after site name
        const siteName = document.getElementById('wp-admin-bar-site-name');
        if (siteName) {
            siteName.parentNode.insertBefore(paginationLi, siteName.nextSibling);
        }
        
        // Add click events with touch support
        document.getElementById('prev-page').addEventListener('click', function() {
            if (currentPage > 0) {
                currentPage--;
                updatePagination();
            }
        });
        
        document.getElementById('next-page').addEventListener('click', function() {
            const maxPage = Math.ceil(paginatableItems.length / itemsPerPage) - 1;
            if (currentPage < maxPage) {
                currentPage++;
                updatePagination();
            }
        });
    }
    
    function updatePagination() {
        // Re-scan for items in case new ones were added
        paginatableItems = scanForMenuItems();
        
        // If we have 3 items or fewer, show all items and don't create pagination
        if (paginatableItems.length <= itemsPerPage) {
            // Show all items since we don't need pagination
            paginatableItems.forEach(selector => {
                const item = document.querySelector(selector);
                if (item) {
                    item.classList.remove('wp-admin-bar-hidden');
                }
            });
            return;
        }
        
        // Calculate total pages
        const totalPages = Math.ceil(paginatableItems.length / itemsPerPage);
        
        // Get pagination controls
        const paginationContainer = document.getElementById('wp-admin-bar-pagination');
        const prevButton = document.getElementById('prev-page');
        const nextButton = document.getElementById('next-page');
        const pageIndicator = document.querySelector('.page-indicator');
        
        // If pagination doesn't exist, create it
        if (!paginationContainer) {
            createPaginationControls();
            return;
        }
        
        // Show pagination controls if we have more items than can fit on one page
        if (paginationContainer) {
            paginationContainer.style.display = 'flex';
        }
        
        // Calculate which items to show on current page
        const startIndex = currentPage * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, paginatableItems.length);
        
        // Debug logging
        console.log('Pagination Debug:', {
            currentPage: currentPage,
            itemsPerPage: itemsPerPage,
            totalItems: paginatableItems.length,
            totalPages: totalPages,
            startIndex: startIndex,
            endIndex: endIndex,
            showingItems: paginatableItems.slice(startIndex, endIndex),
            allItems: paginatableItems
        });
        
        // Hide ALL paginatable items first
        paginatableItems.forEach(selector => {
            const item = document.querySelector(selector);
            if (item) {
                item.classList.add('wp-admin-bar-hidden');
            }
        });
        
        // Show only the items for current page
        for (let i = startIndex; i < endIndex && i < paginatableItems.length; i++) {
            const item = document.querySelector(paginatableItems[i]);
            if (item) {
                item.classList.remove('wp-admin-bar-hidden');
            }
        }
        
        // Update pagination controls
        if (prevButton && nextButton && pageIndicator) {
            prevButton.disabled = currentPage === 0;
            nextButton.disabled = currentPage >= totalPages - 1;
            pageIndicator.textContent = `${currentPage + 1}/${totalPages}`;
        }
    }
    
    function markAlwaysVisible() {
        alwaysVisible.forEach(selector => {
            const item = document.querySelector(selector);
            if (item) {
                item.classList.add('wp-admin-bar-always-visible');
            }
        });
    }
    
    function initToolbar() {
        createPaginationControls();
        markAlwaysVisible();
        updatePagination();
    }
    
    // Initialize on page load
    window.addEventListener('load', initToolbar);
    window.addEventListener('DOMContentLoaded', initToolbar);
    
    // Run with delays to catch dynamic content
    setTimeout(initToolbar, 100);
    setTimeout(initToolbar, 500);
    setTimeout(initToolbar, 1000);
    
    // Watch for DOM changes
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                // Check if toolbar items were added
                const addedNodes = Array.from(mutation.addedNodes);
                const hasToolbarItems = addedNodes.some(node => 
                    node.nodeType === 1 && 
                    (node.id === 'wp-toolbar' || node.querySelector && node.querySelector('#wp-toolbar'))
                );
                
                if (hasToolbarItems) {
                    setTimeout(initToolbar, 50);
                }
            }
        });
    });
    
    observer.observe(document.body, { 
        childList: true, 
        subtree: true 
    });
    
})();
