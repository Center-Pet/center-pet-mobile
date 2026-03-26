import * as React from 'react';
import "./TestDraft.css";
import PhotoGallery from "../../components/Atoms/PhotoGallery/PhotoGallery.jsx";

const TestDraft = () => (
  <div>
    <h1>Galeria de Fotos</h1>
    <PhotoGallery maxImages={5} />
  </div>
);

export default TestDraft;