// src/components/loading.js
import React from "react";
import { Modal, Spinner } from "react-bootstrap";

const Loading = ({ show }) => (
  <Modal show={show} centered>
    <Modal.Body className="text-center">
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </Modal.Body>
  </Modal>
);

export default Loading;
