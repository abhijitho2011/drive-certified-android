import 'package:dio/dio.dart';
import 'api_service.dart';
import '../models/application.dart';

class ApplicationService {
  final ApiService _apiService = ApiService();

  Future<List<Application>> getApplications() async {
    try {
      final response = await _apiService.dio.get('/applications');
      final List<dynamic> data = response.data;
      return data.map((json) => Application.fromJson(json)).toList();
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) return [];
      throw Exception('Failed to fetch applications');
    }
  }

  Future<void> submitApplication(Application application) async {
    try {
      await _apiService.dio.post('/applications', data: application.toJson());
    } on DioException catch (e) {
      throw Exception(
        e.response?.data['message'] ?? 'Failed to submit application',
      );
    }
  }
}
