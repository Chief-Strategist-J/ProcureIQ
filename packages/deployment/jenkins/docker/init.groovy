import hudson.node_monitors.NodeMonitor
import hudson.node_monitors.AbstractNodeMonitorDescriptor
import jenkins.model.Jenkins

for (monitor in NodeMonitor.all()) {
    def descriptor = monitor.getDescriptor()
    if (descriptor instanceof hudson.node_monitors.DiskSpaceMonitorDescriptor || descriptor instanceof hudson.node_monitors.TemporarySpaceMonitorDescriptor) {
        descriptor.setThresholdBytes(1024 * 1024)
    }
}

for (computer in Jenkins.get().getComputers()) {
    if (computer.isOffline() && computer.getOfflineCause() != null) {
        computer.setTemporarilyOffline(false, null)
    }
}
