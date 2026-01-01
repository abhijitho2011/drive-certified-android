import 'package:flutter/foundation.dart';
import '../services/application_service.dart';
import '../models/application.dart';

class ApplicationProvider with ChangeNotifier {
  final ApplicationService _service = ApplicationService();
  List<Application> _applications = [];
  bool _isLoading = false;
  String? _error;

  List<Application> get applications => _applications;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchApplications() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      _applications = await _service.getApplications();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> submitApplication(Application application) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      await _service.submitApplication(application);
      await fetchApplications(); // Refresh list
    } catch (e) {
      _error = e.toString();
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
