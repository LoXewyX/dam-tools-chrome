const Loading = ({ className }: { className?: string }) => {
  return (
    <div className={`flex flex-col justify-center h-100 ${className}`}>
      <div className='text-center'>
        <div className='spinner-border' role='status'></div>
      </div>
      <div className='text-3xl font-bold my-2 mt-2 mb-4 text-center'>
        Now loading...
      </div>
    </div>
  );
};

export default Loading;
