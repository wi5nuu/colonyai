from fastapi import APIRouter

from app.api.v1.endpoints import auth, images, analyses, reports, users, lims, maintenance, simulator

auth_router = APIRouter()
auth_router.add_api_route("/login", auth.login, methods=["POST"])
auth_router.add_api_route("/register", auth.register, methods=["POST"])
auth_router.add_api_route("/refresh", auth.refresh_token, methods=["POST"])
auth_router.add_api_route("/logout", auth.logout, methods=["POST"])

image_router = APIRouter()
image_router.add_api_route("/upload", images.upload_image, methods=["POST"])
image_router.add_api_route("/{image_id}", images.get_image, methods=["GET"])
image_router.add_api_route("/{image_id}", images.delete_image, methods=["DELETE"])

analysis_router = APIRouter()
analysis_router.add_api_route("", analyses.create_analysis, methods=["POST"])
analysis_router.add_api_route("", analyses.list_analyses, methods=["GET"])
analysis_router.add_api_route("/stats", analyses.get_dashboard_stats, methods=["GET"])
analysis_router.add_api_route("/{analysis_id}", analyses.get_analysis, methods=["GET"])
analysis_router.add_api_route("/{analysis_id}/result", analyses.get_analysis_result, methods=["GET"])
analysis_router.add_api_route("/{analysis_id}/approve", analyses.approve_analysis, methods=["POST"])
analysis_router.add_api_route("/{analysis_id}/review", analyses.flag_for_review, methods=["POST"])

report_router = APIRouter()
report_router.add_api_route("/pdf", reports.generate_pdf_report, methods=["POST"])
report_router.add_api_route("/csv", reports.generate_csv_report, methods=["POST"])
report_router.add_api_route("/{report_id}/download", reports.download_report, methods=["GET"])

user_router = APIRouter()
user_router.add_api_route("/me", users.get_current_user_profile, methods=["GET"])
user_router.add_api_route("/me", users.update_current_user_profile, methods=["PATCH"])
user_router.add_api_route("/", users.list_users, methods=["GET"])

lims_router = APIRouter()
lims_router.add_api_route("/sync/{analysis_id}", lims.sync_to_lims, methods=["POST"])
lims_router.add_api_route("/receive-status", lims.receive_lims_status_update, methods=["POST"])
lims_router.add_api_route("/lims-config", lims.get_lims_configuration, methods=["GET"])
lims_router.add_api_route("/configure", lims.configure_lims_integration, methods=["POST"])
lims_router.add_api_route("/batch-sync", lims.batch_sync_to_lims, methods=["POST"])
lims_router.add_api_route("/sync-history", lims.get_sync_history, methods=["GET"])

maintenance_router = APIRouter()
maintenance_router.add_api_route("/retention", maintenance.apply_data_retention_policy, methods=["DELETE"])

simulator_router = APIRouter()
simulator_router.add_api_route("", simulator.save_comparison, methods=["POST"])
simulator_router.add_api_route("", simulator.list_comparisons, methods=["GET"])
simulator_router.add_api_route("/stats", simulator.get_comparator_stats, methods=["GET"])
simulator_router.add_api_route("/analysis/{analysis_id}", simulator.get_comparison, methods=["GET"])
