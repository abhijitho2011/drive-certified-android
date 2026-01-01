import 'package:dio/dio.dart';
import 'api_service.dart';
import '../models/job.dart';

class JobService {
  final ApiService _apiService = ApiService();

  Future<List<Job>> getJobs() async {
    try {
      final response = await _apiService.dio.get(
        '/company/jobs',
      ); // Assuming endpoint
      final List<dynamic> data = response.data;
      return data.map((json) => Job.fromJson(json)).toList();
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) return [];
      // Return empty list on error for now to avoid crashing UI if endpoint doesn't exist
      return [];
    }
  }

  Future<void> applyForJob(String jobId) async {
    try {
      await _apiService.dio.post('/company/jobs/$jobId/apply');
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Failed to apply');
    }
  }
}
