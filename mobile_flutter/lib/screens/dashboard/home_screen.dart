import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/application_provider.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    // Fetch applications on init
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<ApplicationProvider>(
        context,
        listen: false,
      ).fetchApplications();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Motract Driver Portal'),
        automaticallyImplyLeading: false,
      ),
      body: Consumer<ApplicationProvider>(
        builder: (context, appProvider, child) {
          if (appProvider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          final activeApp = appProvider.applications.isNotEmpty
              ? appProvider.applications.first
              : null;

          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text(
                  'Welcome Back!',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),
                Card(
                  margin: const EdgeInsets.all(16),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'Application Status',
                              style: TextStyle(fontWeight: FontWeight.bold),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color:
                                    activeApp != null &&
                                        activeApp.status == 'approved'
                                    ? Colors.green[100]
                                    : Colors.amber[100],
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                activeApp?.status?.toUpperCase() ??
                                    'NO ACTIVE APP',
                                style: TextStyle(
                                  color:
                                      activeApp != null &&
                                          activeApp.status == 'approved'
                                      ? Colors.green
                                      : Colors.amber,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          activeApp != null
                              ? 'Your application is currently ${activeApp.status}.'
                              : 'Start a new application to get certified.',
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                if (activeApp == null)
                  ElevatedButton.icon(
                    onPressed: () {
                      Navigator.of(context).pushNamed('/application-form');
                    },
                    icon: const Icon(Icons.add),
                    label: const Text('New Application'),
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 32,
                        vertical: 16,
                      ),
                    ),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }
}
