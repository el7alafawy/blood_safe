import React from 'react';
import renderer from 'react-test-renderer';

import api.js from '..\src\component\api.js.js';

describe('<api.js />', () => {
    it('should match the snapshot', () => {
      const component = renderer.create(<api.js />).toJSON();
      expect(component).toMatchSnapshot();
    });
  });