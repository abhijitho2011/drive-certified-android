class Application {
  final String? id;
  final String fullName;
  final String dateOfBirth;
  final String gender;
  final String aadhaarNumber;
  final String currentAddress;
  final String permanentAddress;
  final String highestQualification;
  final String licenseNumber;
  final String licenseType;
  final String licenseExpiryDate;
  final String? status;

  Application({
    this.id,
    required this.fullName,
    required this.dateOfBirth,
    required this.gender,
    required this.aadhaarNumber,
    required this.currentAddress,
    required this.permanentAddress,
    required this.highestQualification,
    required this.licenseNumber,
    required this.licenseType,
    required this.licenseExpiryDate,
    this.status,
  });

  factory Application.fromJson(Map<String, dynamic> json) {
    return Application(
      id: json['id'],
      fullName: json['full_name'] ?? '',
      dateOfBirth: json['date_of_birth'] ?? '',
      gender: json['gender'] ?? '',
      aadhaarNumber: json['aadhaar_number'] ?? '',
      currentAddress: json['current_address'] ?? '',
      permanentAddress: json['permanent_address'] ?? '',
      highestQualification: json['highest_qualification'] ?? '',
      licenseNumber:
          json['licence_number'] ?? '', // Note spelling in DB might be licence
      licenseType: json['licence_type'] ?? '',
      licenseExpiryDate: json['licence_expiry_date'] ?? '',
      status: json['status'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'full_name': fullName,
      'date_of_birth': dateOfBirth,
      'gender': gender,
      'aadhaar_number': aadhaarNumber,
      'current_address': currentAddress,
      'permanent_address': permanentAddress,
      'highest_qualification': highestQualification,
      'licence_number': licenseNumber,
      'licence_type': licenseType,
      'licence_expiry_date': licenseExpiryDate,
    };
  }
}
