variable "project_id" {
  description = "The GCP project ID to deploy AlloyDB resources into."
  type        = "string"
}

variable "region" {
  description = "The GCP region to deploy the AlloyDB cluster."
  type        = "string"
  default     = "us-central1"
}

variable "network_name" {
  description = "The name of the VPC network to create."
  type        = "string"
  default     = "procureiq-vpc"
}

variable "cluster_id" {
  description = "The ID of the AlloyDB cluster."
  type        = "string"
  default     = "procureiq-alloydb-cluster"
}

variable "instance_id" {
  description = "The ID of the primary AlloyDB instance."
  type        = "string"
  default     = "procureiq-alloydb-primary"
}

variable "initial_password" {
  description = "The initial password for the default database user (postgres)."
  type        = "string"
  sensitive   = true
}

variable "cpu_count" {
  description = "The number of vCPUs for the primary instance (e.g., 2, 4, 8, 16)."
  type        = number
  default     = 2
}
