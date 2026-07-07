output "cluster_name" {
  description = "The fully qualified resource name of the AlloyDB cluster."
  value       = google_alloydb_cluster.default.name
}

output "primary_instance_name" {
  description = "The fully qualified resource name of the primary AlloyDB instance."
  value       = google_alloydb_instance.primary.name
}

output "primary_instance_ip" {
  description = "The private IP address of the primary AlloyDB instance."
  value       = google_alloydb_instance.primary.ip_address
}

output "network_name" {
  description = "The name of the VPC network."
  value       = google_compute_network.default.name
}
