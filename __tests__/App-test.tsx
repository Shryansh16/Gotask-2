/**
 * @format
 */

import 'react-native';
import React from 'react';
import App from '../src/App';
import renderer, {act} from 'react-test-renderer';

// Mock apiService to prevent network leaks in unit tests
jest.mock('../src/services/apiService', () => ({
  apiService: {
    syncWithServer: jest.fn().mockResolvedValue({success: true, tasks: []}),
    checkServerHealth: jest.fn().mockResolvedValue(true),
    parseNaturalLanguageTask: jest.fn().mockResolvedValue({
      title: 'Mock Task',
      priority: 'medium',
      category: 'Work',
      dueDate: 'Today',
      tags: [],
    }),
  },
  __esModule: true,
  default: {
    syncWithServer: jest.fn().mockResolvedValue({success: true, tasks: []}),
    checkServerHealth: jest.fn().mockResolvedValue(true),
  },
}));

describe('GOTask Core Test Suite', () => {
  it('renders root App and navigation providers without crashing', async () => {
    let tree;
    await act(async () => {
      tree = renderer.create(<App />);
    });
    expect(tree).toBeDefined();
  });
});
