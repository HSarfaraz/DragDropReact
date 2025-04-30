import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import WorkflowBuilder from "./components/WorkflowBuilder.jsx";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <WorkflowBuilder />
    </DndProvider>
  );
}

export default App;
