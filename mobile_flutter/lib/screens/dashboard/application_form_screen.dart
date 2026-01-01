import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/application_provider.dart';
import '../../models/application.dart';

class ApplicationFormScreen extends StatefulWidget {
  const ApplicationFormScreen({super.key});

  @override
  State<ApplicationFormScreen> createState() => _ApplicationFormScreenState();
}

class _ApplicationFormScreenState extends State<ApplicationFormScreen> {
  int _currentStep = 0;
  final _formKey = GlobalKey<FormState>();

  // Controllers
  final _fullNameController = TextEditingController();
  final _dobController = TextEditingController();
  final _genderController = TextEditingController();
  final _aadhaarController = TextEditingController();
  final _currentAddressController = TextEditingController();
  final _permAddressController = TextEditingController();
  final _qualificationController = TextEditingController();
  final _licenseNoController = TextEditingController();
  final _licenseTypeController = TextEditingController(); // e.g., LMV
  final _licenseExpiryController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('New Application')),
      body: Form(
        key: _formKey,
        child: Stepper(
          currentStep: _currentStep,
          onStepContinue: () {
            if (_currentStep < 2) {
              setState(() => _currentStep += 1);
            } else {
              _submitForm();
            }
          },
          onStepCancel: () {
            if (_currentStep > 0) {
              setState(() => _currentStep -= 1);
            } else {
              Navigator.of(context).pop();
            }
          },
          steps: [
            Step(
              title: const Text('Personal Details'),
              content: Column(
                children: [
                  TextFormField(
                    controller: _fullNameController,
                    decoration: const InputDecoration(labelText: 'Full Name'),
                  ),
                  TextFormField(
                    controller: _dobController,
                    decoration: const InputDecoration(
                      labelText: 'Date of Birth (YYYY-MM-DD)',
                    ),
                  ),
                  TextFormField(
                    controller: _genderController,
                    decoration: const InputDecoration(labelText: 'Gender'),
                  ),
                  TextFormField(
                    controller: _aadhaarController,
                    decoration: const InputDecoration(
                      labelText: 'Aadhaar Number',
                    ),
                  ),
                  TextFormField(
                    controller: _currentAddressController,
                    decoration: const InputDecoration(
                      labelText: 'Current Address',
                    ),
                  ),
                  TextFormField(
                    controller: _permAddressController,
                    decoration: const InputDecoration(
                      labelText: 'Permanent Address',
                    ),
                  ),
                ],
              ),
              isActive: _currentStep >= 0,
            ),
            Step(
              title: const Text('Education & License'),
              content: Column(
                children: [
                  TextFormField(
                    controller: _qualificationController,
                    decoration: const InputDecoration(
                      labelText: 'Highest Qualification',
                    ),
                  ),
                  TextFormField(
                    controller: _licenseNoController,
                    decoration: const InputDecoration(
                      labelText: 'License Number',
                    ),
                  ),
                  TextFormField(
                    controller: _licenseTypeController,
                    decoration: const InputDecoration(
                      labelText: 'License Type (e.g., LMV)',
                    ),
                  ),
                  TextFormField(
                    controller: _licenseExpiryController,
                    decoration: const InputDecoration(
                      labelText: 'License Expiry (YYYY-MM-DD)',
                    ),
                  ),
                ],
              ),
              isActive: _currentStep >= 1,
            ),
            Step(
              title: const Text('Review & Submit'),
              content: const Text(
                'Please review your details before submitting.',
              ),
              isActive: _currentStep >= 2,
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _submitForm() async {
    if (_formKey.currentState!.validate()) {
      final app = Application(
        fullName: _fullNameController.text,
        dateOfBirth: _dobController.text,
        gender: _genderController.text,
        aadhaarNumber: _aadhaarController.text,
        currentAddress: _currentAddressController.text,
        permanentAddress: _permAddressController.text,
        highestQualification: _qualificationController.text,
        licenseNumber: _licenseNoController.text,
        licenseType: _licenseTypeController.text,
        licenseExpiryDate: _licenseExpiryController.text,
        status: 'pending',
      );

      try {
        await Provider.of<ApplicationProvider>(
          context,
          listen: false,
        ).submitApplication(app);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Application Submitted Successfully!'),
            ),
          );
          Navigator.of(context).pop();
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
          );
        }
      }
    }
  }
}
