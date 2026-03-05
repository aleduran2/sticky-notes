// Componente temporal para probar el Error Boundary
// Este componente lanza un error para verificar que el boundary lo capture

export function ErrorTest() {
  // Este componente siempre lanza un error
  throw new Error("Test error for Error Boundary");

  // Este código nunca se ejecuta
  return <div>This should never render</div>;
}