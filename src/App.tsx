/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FinanceProvider } from './context/FinanceContext';
import { Layout } from './components/layout/Layout';

export default function App() {
  return (
    <FinanceProvider>
      <Layout />
    </FinanceProvider>
  );
}

