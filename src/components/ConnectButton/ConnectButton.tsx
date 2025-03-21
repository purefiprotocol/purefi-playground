import { FC } from 'react';
import { useMediaQuery } from 'react-responsive';

const ConnectButton: FC = () => {
  const isMobile = useMediaQuery({
    query: '(max-width: 992px)',
  });

  return (
    <div>
      <w3m-button balance={isMobile ? 'hide' : 'show'} size="sm" />
    </div>
  );
};

export default ConnectButton;
