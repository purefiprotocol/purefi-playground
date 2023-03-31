import openSrc from '../../assets/icons/open.svg';

function TxnToastSuccess(props) {
  const { url } = props;
  return (
    <>
      <span style={{ marginRight: 10 }}>Success!</span>
      <span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            color: '#25A2E9',
          }}
        >
          <span style={{ marginRight: 5 }}>txn</span>
          <img height="12px" src={openSrc} alt="open" />
        </a>
      </span>
    </>
  );
}

export default TxnToastSuccess;
