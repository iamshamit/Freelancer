import { motion } from 'framer-motion';
import { FiServer, FiDatabase, FiWifi, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

const SystemHealthCard = ({ systemHealth }) => {
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getHealthStatus = () => {
    const dbConnected = systemHealth?.database?.connection?.status === 'connected';
    const memoryUsage = systemHealth?.server?.memoryUsage?.heapUsed / systemHealth?.server?.memoryUsage?.heapTotal;
    const hasErrors = systemHealth?.errors?.length > 0;
    
    if (!dbConnected || hasErrors) return { status: 'critical', color: 'red', icon: FiAlertTriangle };
    if (memoryUsage > 0.9) return { status: 'warning', color: 'yellow', icon: FiAlertTriangle };
    return { status: 'healthy', color: 'green', icon: FiCheckCircle };
  };

  const healthStatus = getHealthStatus();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          System Health
        </h3>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
          healthStatus.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
          healthStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          <healthStatus.icon className="w-4 h-4" />
          {healthStatus.status}
        </div>
      </div>

      <div className="space-y-6">
        {/* Database Health */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FiDatabase className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h4 className="font-medium text-gray-900 dark:text-white">Database</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-4 ml-7">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
              <div className={`font-medium ${
                systemHealth?.database?.connection?.status === 'connected' 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {systemHealth?.database?.connection?.status || 'Unknown'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Collections</div>
              <div className="font-medium text-gray-900 dark:text-white">
                {systemHealth?.database?.stats?.collections || 0}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Data Size</div>
              <div className="font-medium text-gray-900 dark:text-white">
                {formatBytes(systemHealth?.database?.stats?.dataSize || 0)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Storage Size</div>
              <div className="font-medium text-gray-900 dark:text-white">
                {formatBytes(systemHealth?.database?.stats?.storageSize || 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Server Health */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FiServer className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h4 className="font-medium text-gray-900 dark:text-white">Server</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-4 ml-7">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Uptime</div>
              <div className="font-medium text-gray-900 dark:text-white">
                {formatUptime(systemHealth?.server?.uptime || 0)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Memory Used</div>
              <div className="font-medium text-gray-900 dark:text-white">
                {formatBytes(systemHealth?.server?.memoryUsage?.heapUsed || 0)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Memory Total</div>
              <div className="font-medium text-gray-900 dark:text-white">
                {formatBytes(systemHealth?.server?.memoryUsage?.heapTotal || 0)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Node Version</div>
              <div className="font-medium text-gray-900 dark:text-white">
                {systemHealth?.server?.nodeVersion || 'Unknown'}
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Connections */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FiWifi className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h4 className="font-medium text-gray-900 dark:text-white">Real-time</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-4 ml-7">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Socket Connections</div>
              <div className="font-medium text-gray-900 dark:text-white">
                {systemHealth?.realtime?.socketConnections || 0}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
              <div className={`font-medium ${
                systemHealth?.realtime?.status === 'active' 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                {systemHealth?.realtime?.status || 'Inactive'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SystemHealthCard;