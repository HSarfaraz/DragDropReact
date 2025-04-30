// src/components/ItemComponents.jsx
import React, { forwardRef, useEffect, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Modal, Button, Form } from "react-bootstrap";
import { X } from "lucide-react";
import { ItemTypes } from "../utils";

// Menu Component
function Menu({ menuItems }) {
  return (
    <div className="p-3">
      <h4 className="mb-4 p-3 text-white">Everest Task Store</h4>
      <div className="d-flex flex-column">
        {menuItems.map((item) => (
          <DraggableItem key={item.type} item={item} />
        ))}
      </div>
    </div>
  );
}

// Draggable Item Component
function DraggableItem({ item }) {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.MENU_ITEM,
    item: () => ({
      ...item,
      id: `${item.type}-${Date.now()}`,
    }),
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className="card mb-3 mx-3"
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: "move",
        backgroundColor: "#FFF2CC",
        border: "1px solid #E6C74C",
      }}
    >
      <div className="card-body py-2 px-3">
        <h6 className="card-title mb-0">{item.name}</h6>
      </div>
    </div>
  );
}

// Workspace Component
const Workspace = forwardRef(
  (
    { items, onItemClick, onRemoveItem, onRemoveNote, onDrop, onResize },
    ref
  ) => {
    const [{ isOver }, drop] = useDrop({
      accept: ItemTypes.MENU_ITEM,
      drop: (item) => {
        onDrop(item);
        return undefined;
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    });

    // Set up resize observer
    useEffect(() => {
      const resizeObserver = new ResizeObserver(() => {
        onResize();
      });

      if (ref && ref.current) {
        resizeObserver.observe(ref.current);
      }

      return () => {
        resizeObserver.disconnect();
      };
    }, [ref, onResize]);

    // Function to determine if two items should be connected with an arrow
    const shouldDrawArrow = (item1, item2) => {
      const index1 = items.findIndex((i) => i.id === item1.id);
      const index2 = items.findIndex((i) => i.id === item2.id);
      return index2 === index1 + 1;
    };

    // Generate all possible arrows between items
    const arrows = [];
    for (let i = 0; i < items.length; i++) {
      for (let j = 0; j < items.length; j++) {
        if (i !== j && shouldDrawArrow(items[i], items[j])) {
          arrows.push({ from: items[i], to: items[j] });
        }
      }
    }

    return (
      <div className="d-flex flex-column flex-grow-1">
        <div className="bg-primary text-white p-2">
          <h4 className="m-0">EverFlow Workspace</h4>
        </div>
        <div
          ref={(node) => {
            drop(node);
            if (ref) ref.current = node;
          }}
          className="position-relative flex-grow-1"
          style={{
            backgroundColor: "#E6F2FF",
            minHeight: "400px",
            overflow: "auto",
            border: isOver ? "2px dashed #007bff" : "none",
          }}
        >
          {/* Render all arrows */}
          {arrows.map((arrow, index) => (
            <Arrow
              key={`arrow-${index}`}
              startItem={arrow.from}
              endItem={arrow.to}
            />
          ))}

          {/* Render all items */}
          {items.map((item) => (
            <WorkspaceItem
              key={item.id}
              item={item}
              onClick={() => onItemClick(item)}
              onRemove={onRemoveItem}
              onRemoveNote={onRemoveNote}
            />
          ))}
        </div>
      </div>
    );
  }
);

Workspace.displayName = "Workspace";

// Workspace Item Component
function WorkspaceItem({ item, onClick, onRemove, onRemoveNote }) {
  return (
    <div
      className="position-absolute card"
      style={{
        left: item.position.x,
        top: item.position.y,
        width: "150px",
        cursor: "pointer",
        zIndex: 10,
        backgroundColor: "#FFF2CC",
        border: "1px solid #E6C74C",
      }}
      onClick={onClick}
    >
      <div className="card-body py-2 px-3">
        <h6 className="card-title mb-0">{item.name}</h6>
      </div>

      {item.hasNote && (
        <div className="card-footer p-1 d-flex align-items-center">
          <span className="badge bg-info text-dark me-1">Note</span>
          <button
            className="btn btn-sm p-0"
            style={{ width: "16px", height: "16px", lineHeight: "0" }}
            onClick={(e) => {
              e.stopPropagation();
              onRemoveNote(item.id);
            }}
          >
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
}

// Arrow Component - FIXED to connect at the end
function Arrow({ startItem, endItem }) {
  // Calculate start and end points for the arrow
  const startX = startItem.position.x + 150; // Right side of the start item
  const startY = startItem.position.y + 20; // Middle of the start item
  const endX = endItem.position.x; // Left side of the end item
  const endY = endItem.position.y + 20; // Middle of the end item

  // Determine if the items are on the same row or different rows
  const isSameRow = Math.abs(startY - endY) < 30;

  // Draw an SVG path for the arrow
  let path;
  if (isSameRow) {
    // Straight horizontal arrow
    path = `M ${startX} ${startY} L ${startX + 10} ${startY} L ${
      endX - 10
    } ${endY} L ${endX} ${endY}`;
  } else {
    // For items on different rows, create a path that goes from the end of the first item
    // to the start of the second item with a curve
    const midX1 = startX + 20;
    const midX2 = endX - 20;

    if (startItem.position.y < endItem.position.y) {
      // If the second item is below the first
      path = `M ${startX} ${startY} 
              L ${midX1} ${startY} 
              C ${midX1 + 50} ${startY}, ${
        midX1 + 50
      } ${endY}, ${midX2} ${endY} 
              L ${endX} ${endY}`;
    } else {
      // If the second item is above the first
      path = `M ${startX} ${startY} 
              L ${midX1} ${startY} 
              C ${midX1 + 50} ${startY}, ${
        midX1 + 50
      } ${endY}, ${midX2} ${endY} 
              L ${endX} ${endY}`;
    }
  }

  // Calculate arrow head points
  const arrowLength = 10;
  const arrowWidth = 6;

  return (
    <svg
      className="position-absolute"
      style={{
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 5,
      }}
    >
      <path d={path} stroke="black" strokeWidth="2" fill="none" />
      <polygon
        points={`${endX},${endY} ${endX - arrowLength},${
          endY - arrowWidth / 2
        } ${endX - arrowLength},${endY + arrowWidth / 2}`}
        fill="black"
      />
    </svg>
  );
}

// Selected Elements Component
function SelectedElements({ items, onRemoveItem }) {
  if (items.length === 0) return null;

  return (
    <div className="p-3" style={{ backgroundColor: "#E6F2FF" }}>
      <h6 className="mb-3">Selected Elements:</h6>
      <div className="d-flex flex-wrap gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="d-flex align-items-center p-2 rounded"
            style={{ backgroundColor: "#FFF2CC", border: "1px solid #E6C74C" }}
          >
            <span className="me-2">{item.name}</span>
            <button
              className="btn btn-sm btn-danger p-0 d-flex align-items-center justify-content-center"
              style={{ width: "20px", height: "20px", borderRadius: "50%" }}
              onClick={() => onRemoveItem(item.id)}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Action Buttons Component
function ActionButtons({ onAction }) {
  return (
    <div className="d-flex justify-content-center gap-4 py-3">
      <button
        className="btn btn-outline-primary rounded-pill px-4"
        onClick={() => onAction("Save Pipeline")}
        style={{ minWidth: "150px" }}
      >
        Save Pipeline
      </button>
      <button
        className="btn btn-outline-primary rounded-pill px-4"
        onClick={() => onAction("Export Pipeline")}
        style={{ minWidth: "150px" }}
      >
        Export Pipeline
      </button>
      <button
        className="btn btn-outline-primary rounded-pill px-4"
        onClick={() => onAction("Run Pipeline")}
        style={{ minWidth: "150px" }}
      >
        Run Pipeline
      </button>
    </div>
  );
}

// Modal Component - FIXED
function ItemModal({ show, onHide, onSave, item }) {
  const [note, setNote] = useState("");

  useEffect(() => {
    if (item && show) {
      setNote(item.note || "");
    }
  }, [item, show]);

  const handleSave = () => {
    onSave(note);
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{item?.name || "Item"} Configuration</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam."
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export const ItemComponents = {
  Menu,
  Workspace,
  WorkspaceItem,
  Arrow,
  SelectedElements,
  ActionButtons,
  Modal: ItemModal, // Fixed: Export the modal component with the correct name
};
