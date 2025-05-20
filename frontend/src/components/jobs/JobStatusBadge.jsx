// src/components/jobs/JobStatusBadge.jsx
import Badge from '../common/Badge';

const JobStatusBadge = ({ status }) => {
  // Determine status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'success';
      case 'in_progress':
        return 'primary';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'danger';
      default:
        return 'default';
    }
  };

  // Format status text
  const formatStatus = (status) => {
    return status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1);
  };

  return (
    <Badge variant={getStatusColor(status)}>
      {formatStatus(status)}
    </Badge>
  );
};

export default JobStatusBadge;