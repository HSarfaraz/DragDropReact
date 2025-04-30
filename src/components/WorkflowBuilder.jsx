// src/components/WorkflowBuilder.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { ItemComponents } from './ItemComponents';
import { menuItems } from '../utils';

function WorkflowBuilder() {
  const [workspaceItems, setWorkspaceItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const workspaceRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Update container width on mount and resize
  useEffect(() => {
    const updateWidth = () => {
      if (workspaceRef.current) {
        setContainerWidth(workspaceRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Add an item to the workspace
  const handleAddItem = (item) => {
    const newItem = {
      ...item,
      id: `${item.type}-${Date.now()}`,
      position: { x: 0, y: 0 }, // Initial position will be calculated in rearrangeItems
      hasNote: false,
      note: '',
    };

    // Add the new item and rearrange all items
    const updatedItems = [...workspaceItems, newItem];
    rearrangeItems(updatedItems);
  };

  // Calculate positions for all items with wrapping
  const rearrangeItems = (items) => {
    if (containerWidth === 0) return;

    const itemWidth = 150; // Width of each item
    const itemHeight = 40; // Height of each item
    const horizontalSpacing = 100; // Space between items horizontally
    const verticalSpacing = 80; // Space between rows
    const horizontalMargin = 50; // Margin from the left edge
    const verticalMargin = 50; // Margin from the top edge
    const maxItemsPerRow = Math.max(
      1,
      Math.floor((containerWidth - horizontalMargin) / (itemWidth + horizontalSpacing))
    );

    const rearranged = items.map((item, index) => {
      const row = Math.floor(index / maxItemsPerRow);
      const col = index % maxItemsPerRow;

      return {
        ...item,
        position: {
          x: horizontalMargin + col * (itemWidth + horizontalSpacing),
          y: verticalMargin + row * (itemHeight + verticalSpacing),
        },
      };
    });

    setWorkspaceItems(rearranged);
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleSaveNote = (note) => {
    if (selectedItem) {
      setWorkspaceItems(
        workspaceItems.map((item) => (item.id === selectedItem.id ? { ...item, hasNote: true, note } : item))
      );
      setShowModal(false);
    }
  };

  const handleRemoveNote = (itemId) => {
    setWorkspaceItems(workspaceItems.map((item) => (item.id === itemId ? { ...item, hasNote: false, note: '' } : item)));
  };

  const handleRemoveItem = (id) => {
    const updatedItems = workspaceItems.filter((item) => item.id !== id);
    rearrangeItems(updatedItems);
  };

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  return (
    <div className="container-fluid vh-100 d-flex flex-column">
      <div className="row flex-grow-1">
        <div className="col-3 p-0 border-end" style={{ backgroundColor: '#222' }}>
          <ItemComponents.Menu menuItems={menuItems} />
        </div>
        <div className="col-9 p-0 d-flex flex-column">
          <ItemComponents.Workspace
            ref={workspaceRef}
            items={workspaceItems}
            onItemClick={handleItemClick}
            onRemoveItem={handleRemoveItem}
            onRemoveNote={handleRemoveNote}
            onDrop={handleAddItem}
            onResize={() => rearrangeItems(workspaceItems)}
          />
          <ItemComponents.SelectedElements items={workspaceItems} onRemoveItem={handleRemoveItem} />
        </div>
      </div>
      <div className="row border-top">
        <div className="col-12">
          <ItemComponents.ActionButtons
            onAction={(action) => {
              showToast(`${action} action triggered`);
            }}
          />
        </div>
      </div>

      {/* Fixed: Use the correct component name */}
      <ItemComponents.Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSave={handleSaveNote}
        item={selectedItem}
      />

      <ToastContainer position="bottom-end" className="p-3">
        <Toast show={toast.show} onClose={() => setToast({ show: false, message: '' })}>
          <Toast.Header>
            <strong className="me-auto">Notification</strong>
          </Toast.Header>
          <Toast.Body>{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
}

export default WorkflowBuilder;
