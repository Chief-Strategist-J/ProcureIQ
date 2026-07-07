terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}
resource "google_compute_network" "default" {
  name                    = var.network_name
  auto_create_subnetworks = true
}

resource "google_compute_global_address" "private_ip_alloc" {
  name          = "${var.network_name}-private-ip-alloc"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.default.id
}

resource "google_service_networking_connection" "default" {
  network                 = google_compute_network.default.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_alloc.name]
}

resource "google_alloydb_cluster" "default" {
  cluster_id = var.cluster_id
  location   = var.region
  network    = google_compute_network.default.id

  initial_user {
    password = var.initial_password
  }

  depends_on = [
    google_service_networking_connection.default
  ]
}

resource "google_alloydb_instance" "primary" {
  cluster       = google_alloydb_cluster.default.name
  instance_id   = var.instance_id
  instance_type = "PRIMARY"

  machine_config {
    cpu_count = var.cpu_count
  }
}
