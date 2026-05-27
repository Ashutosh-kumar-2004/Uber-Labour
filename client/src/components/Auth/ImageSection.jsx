const ImageSection = () => {
  return (
    <div
      className="relative hidden md:flex w-3/5 min-h-screen overflow-hidden bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1504384308090-c894fdcc538d')",
      }}
    >
      <div className="absolute inset-0 bg-black/70" />

      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-10 text-white text-center">
        <h1 className="text-5xl font-bold mb-4">Workify</h1>
        <p className="text-xl max-w-md">
          Find trusted workers or get hired for your skills — all in one place.
        </p>
      </div>
    </div>
  );
};
export default ImageSection;
