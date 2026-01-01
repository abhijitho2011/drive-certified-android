class Job {
  final String? id;
  final String title;
  final String description;
  final String location;
  final String? salaryMin;
  final String? salaryMax;
  final List<String> requiredVehicleClasses;
  final String employerName;
  final String postedAt;

  Job({
    this.id,
    required this.title,
    required this.description,
    required this.location,
    this.salaryMin,
    this.salaryMax,
    required this.requiredVehicleClasses,
    required this.employerName,
    required this.postedAt,
  });

  factory Job.fromJson(Map<String, dynamic> json) {
    return Job(
      id: json['id'],
      title: json['title'] ?? 'Untitled Job',
      description: json['description'] ?? '',
      location: json['location'] ?? 'Unknown',
      salaryMin: json['salary_min']?.toString(),
      salaryMax: json['salary_max']?.toString(),
      requiredVehicleClasses:
          (json['vehicle_class_required'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      employerName: json['employer']?['company_name'] ?? 'Confidential',
      postedAt: json['created_at'] ?? '',
    );
  }
}
