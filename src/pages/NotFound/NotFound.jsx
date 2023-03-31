import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="container-fluid">
      <div className="alert alert-primary mb-2" role="alert">
        <span className="mr-2">Page not found</span>
        <div>
          <Link to="/">Go to main page</Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
