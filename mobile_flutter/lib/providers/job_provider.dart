import 'package:flutter/foundation.dart';
import '../services/job_service.dart';
import '../models/job.dart';

class JobProvider with ChangeNotifier {
  final JobService _service = JobService();
  List<Job> _jobs = [];
  bool _isLoading = false;
  String? _error;

  List<Job> get jobs => _jobs;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchJobs() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      _jobs = await _service.getJobs();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> applyForJob(String jobId) async {
    // Optimistic or waiting? Let's wait.
    try {
      await _service.applyForJob(jobId);
      // Maybe refresh jobs or remove the applied one?
    } catch (e) {
      rethrow;
    }
  }
}
