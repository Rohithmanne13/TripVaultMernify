import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let passed = 0;
let failed = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`✓ ${description}`);
    passed++;
  } catch (error) {
    console.error(`✗ ${description}`);
    console.error(`  ${error.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// Run tests
console.log('Running Backend Tests...\n');

test('Project structure exists', () => {
  const backendDir = path.join(__dirname, '..');
  assert(fs.existsSync(backendDir), 'Backend directory should exist');
  assert(fs.existsSync(path.join(backendDir, 'index.js')), 'index.js should exist');
  assert(fs.existsSync(path.join(backendDir, 'package.json')), 'package.json should exist');
});

test('Required directories exist', () => {
  const backendDir = path.join(__dirname, '..');
  assert(fs.existsSync(path.join(backendDir, 'controllers')), 'controllers directory should exist');
  assert(fs.existsSync(path.join(backendDir, 'models')), 'models directory should exist');
  assert(fs.existsSync(path.join(backendDir, 'routes')), 'routes directory should exist');
});

test('All controller files exist', () => {
  const controllersDir = path.join(__dirname, '..', 'controllers');
  const expectedControllers = [
    'CapturesController.js',
    'ClerkController.js',
    'ExpensesController.js',
    'ProposalController.js',
    'TripController.js'
  ];
  
  expectedControllers.forEach(controller => {
    assert(
      fs.existsSync(path.join(controllersDir, controller)),
      `${controller} should exist`
    );
  });
});

test('All model files exist', () => {
  const modelsDir = path.join(__dirname, '..', 'models');
  const expectedModels = [
    'CaptureModel.js',
    'ExpenseModel.js',
    'PaymentSettingsModel.js',
    'ProposalModel.js',
    'TripModel.js',
    'UserModel.js'
  ];
  
  expectedModels.forEach(model => {
    assert(
      fs.existsSync(path.join(modelsDir, model)),
      `${model} should exist`
    );
  });
});

test('All route files exist', () => {
  const routesDir = path.join(__dirname, '..', 'routes');
  const expectedRoutes = [
    'CapturesRoutes.js',
    'ClerkRoutes.js',
    'ExpensesRoutes.js',
    'ProposalRoutes.js',
    'TripRoutes.js'
  ];
  
  expectedRoutes.forEach(route => {
    assert(
      fs.existsSync(path.join(routesDir, route)),
      `${route} should exist`
    );
  });
});

test('Package.json has required dependencies', () => {
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const requiredDeps = ['express', 'mongoose', 'cors', 'dotenv'];
  requiredDeps.forEach(dep => {
    assert(
      packageJson.dependencies[dep],
      `${dep} should be in dependencies`
    );
  });
});

test('Basic arithmetic works', () => {
  assert(2 + 2 === 4, '2 + 2 should equal 4');
  assert(10 - 5 === 5, '10 - 5 should equal 5');
});

// Print summary
console.log(`\n${'='.repeat(40)}`);
console.log(`Tests: ${passed + failed}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`${'='.repeat(40)}`);

// Exit with appropriate code
process.exit(failed > 0 ? 1 : 0);
