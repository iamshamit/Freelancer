// src/components/applications/ApplicationStatusBadge.jsx
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import Badge from '../common/Badge';

const ApplicationStatusBadge = ({ status }) => {
  // Get status badge variant
  const getStatusVariant = (status) => {
    switch (status) {
      case 'accepted': return 'success';
      case 'rejected': return 'danger';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="h-4 w-4 mr-1" />;
      case 'rejected': return <XCircle className="h-4 w-4 mr-1" />;
      case 'pending': return <Clock className="h-4 w-4 mr-1" />;
      default: return null;
    }
  };

  // Format status text
  const formatStatus = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <Badge variant={getStatusVariant(status)} className="flex items-center">
      {getStatusIcon(status)}
      <span>{formatStatus(status)}</span>
    </Badge>
  );
};

export default ApplicationStatusBadge;