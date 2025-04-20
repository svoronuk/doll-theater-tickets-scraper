import { fixupConfigRules, fixupPluginRules } from '@eslint/compat';
import reactHooks from 'eslint-plugin-react-hooks';
import react from 'eslint-plugin-react';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import prettier from 'eslint-plugin-prettier';
import customRules from 'eslint-plugin-custom-rules';
import promise from 'eslint-plugin-promise';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all,
});

export default [
	{
		ignores: ['**/*.js', '**/*.snap', '**/*.d.ts'],
	},
	...fixupConfigRules(
		compat.extends(
			'eslint:recommended',
			'plugin:react/recommended',
			'plugin:react-hooks/recommended',
			'plugin:@typescript-eslint/recommended',
			'plugin:@next/next/recommended',
			'prettier'
		)
	),
	{
		plugins: {
			'react-hooks': fixupPluginRules(reactHooks),
			react: fixupPluginRules(react),
			'@typescript-eslint': fixupPluginRules(typescriptEslint),
			prettier,
			'custom-rules': customRules,
			promise,
		},

		languageOptions: {
			globals: {
				...globals.browser,
			},

			parser: tsParser,
			ecmaVersion: 'latest',
			sourceType: 'module',
		},

		settings: {
			react: {
				version: 'detect',
			},
		},

		rules: {
			'react/jsx-props-no-spreading': [2],

			'promise/catch-or-return': [
				2,
				{
					allowFinally: true,
				},
			],
			'no-restricted-syntax': [
				'error',
				{
					selector:
						"ImportSpecifier[imported.name='Link'][local.name='Link'][parent.source.value='@material-ui/core']",
					message:
						"For page routing `import { Link } from sharedComponents` If you need the material-ui link - `import { Link as MuiLink } from '@material-ui/core`.",
				},
			],
			'@typescript-eslint/ban-types': 'off',
			'no-constant-binary-expression': 'off',
			'@typescript-eslint/no-empty-function': 'off',
			'@typescript-eslint/no-empty-interface': 'off',
			'@typescript-eslint/no-inferrable-types': 'off',
			'@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
			'@typescript-eslint/no-var-requires': 'off',
			'no-async-promise-executor': 'off',
			'no-case-declarations': 'off',
			'no-constant-condition': 'off',
			'no-empty-pattern': 'off',
			'no-extra-boolean-cast': 'off',
			'no-prototype-builtins': 'off',
			'no-unsafe-optional-chaining': 'off',
			'no-useless-escape': 'off',
			'no-var': 'off',
			'prefer-const': 'off',
			'react-hooks/exhaustive-deps': 'off',
			'react/display-name': 'off',
			'react/jsx-key': 'off',
			'react/jsx-no-target-blank': 'off',
			'react/no-deprecated': 'off',
			'react/no-unescaped-entities': 'off',
			'react/no-unknown-property': 'off',
			'react/prop-types': 'off',
			'react/react-in-jsx-scope': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-non-null-assertion': 'off',
			'@typescript-eslint/ban-ts-comment': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
			'react/no-unused-prop-types': [2],
			'no-empty': 'off',
			'@typescript-eslint/no-misused-new': 'off',
			'@next/next/no-img-element': 'off',
			'@next/next/no-html-link-for-pages': ['error', 'app/pages'],
			eqeqeq: [2, 'always'],

			'prettier/prettier': [
				2,
				{
					printWidth: 100,
					singleQuote: true,
					jsxSingleQuote: true,
					trailingComma: 'es5',
					useTabs: true,
				},
			],

			'no-nested-ternary': 'error',
			'custom-rules/no-direct-node-modules-import': 'error',
				'custom-rules/prefer-mui-direct-import': 'error',

			'no-restricted-imports': [
				'error',
				{
					patterns: [
						{
							group: ['@mui/*/*/*'],
							message:
								'Wrong import path. See https://mui.com/material-ui/guides/minimizing-bundle-size/?srsltid=AfmBOoouKHRzuwLsrZjHL8d1N1tEN0wQkuzqsvzZDdF1Z-MwhC449Hze',
						},
						{
							group: [
								'**/../sharedComponents**',
								'**/design/types',
								'design/types',
								'**/design/patterns/Menu**',
								'design/patterns/Menu**',
								'**/design/patterns/ActionsMenu**',
								'design/patterns/ActionsMenu**',
								'**/design/layout/MasterDetails**',
								'design/layout/MasterDetails**',
								'**/design/elements/IconFont/**',
								'design/elements/IconFont/**',
								'**/design/layout/SideNavigation**',
								'design/layout/SideNavigation**',
								'components/TransactionSplit/makeAxiosRetryRequest',
							],
						},
						{
							group: [
								'@material-ui/core/*',
								'@material-ui/lab/*',
								'@material-ui/pickers/*',
								'!@material-ui/core/styles',
								'!@material-ui/pickers/constants',
							],

							message:
								"Material UI components should be imported from package root:  '@material-ui/core' or '@material-ui/lab or '@material-ui/pickers'.",
						},
						{
							group: ['travelAgent/*', 'travelAgent/**'],
							message:
								'Travel agent code can be used only under route `/travel/agents`.',
						},
						{
							group: ['AnonymousFlows/*', 'AnonymousFlows/**'],
							message: 'AnonymousFlows should not be imported',
						},
					],

					paths: [
						{
							name: '@mesh-payments/fox-design-system',
							importNames: ['Link'],
							message:
								'Dont use `Link` from `@mesh-payments/fox-design-system` for redirecting to other pages. Use `Link` instead.',
						},
						{
							name: 'react-pin-input',
							importNames: ['default'],
							message:
								"Importing ReactPinInput from 'react-pin-input' is forbidden. Use VerificationInput from 'react-verification-input';",
						},
						{
							name: 'utils/deprecatedHandleAxiosError',
							importNames: ['default'],
							message:
								"Importing 'deprecatedHandleAxiosError' from '../utils/ErrorHandler' is deprecated. Please use an alternative error handling function.",
						},
						{
							name: 'next/image',
							message: 'Please use alternative methods for importing images.',
						},
						{
							name: 'axios',
							importNames: ['default'],
							message: 'Use axiosInstance instead.',
						},
						{
							name: '@mesh-payments/fox-utils',
							importNames: ['useRouterService'],
							message:
								"Importing 'useRouterService' from '@mesh-payments/fox-utils' is not allowed. Use 'useRouter' from 'next/router' instead.",
						},
					],
				},
			],
		},
	},
	{
		files: ['**/*.tsx'],
		ignores: ['**/use*.tsx'],

		rules: {
			'max-lines': [
				'error',
				{
					max: 320,
					skipBlankLines: true,
					skipComments: true,
				},
			],
		},
	},
	{
		files: ['**/*.stories.*', '**/*.test.*'],

		rules: {
			'react/jsx-props-no-spreading': 'off',
		},
	},
	{
		files: ['**/*.stories.*', '**/*.test.*'],

		rules: {
			'react/jsx-props-no-spreading': 'off',
		},
	},
	{
		files: ['**/*.stories.*', '**/*.test.*'],
		rules: {
			'no-console': 'off',
		},
	},
	{
		files: ['**/travelDesign/**', 'travelDesign/*/**'],

		rules: {
			'no-restricted-imports': [
				'error',
				{
					patterns: [
						{
							group: ['@mui/*/*/*'],
							message:
								'Wrong import path. See https://mui.com/material-ui/guides/minimizing-bundle-size/?srsltid=AfmBOoouKHRzuwLsrZjHL8d1N1tEN0wQkuzqsvzZDdF1Z-MwhC449Hze',
						},
						{
							group: ['**/features/**'],
						},
						{
							group: [
								'@material-ui/core/*',
								'@material-ui/lab/*',
								'@material-ui/pickers/*',
								'!@material-ui/core/styles',
								'!@material-ui/pickers/constants',
							],

							message:
								"Material UI components should be imported from package root:  '@material-ui/core' or '@material-ui/lab or '@material-ui/pickers'.",
						},
						{
							group: ['travelAgent/*', 'travelAgent/**'],
							message:
								'Travel agent code can be used only under route `/travel/agents`.',
						},
					],
					paths: [
						{
							name: '@mesh-payments/fox-design-system',
							importNames: ['Link'],
							message:
								'Dont use `Link` from `@mesh-payments/fox-design-system` for redirecting to other pages. Use `Link` instead.',
						},
						{
							name: 'react-pin-input',
							importNames: ['default'],
							message:
								"Importing ReactPinInput from 'react-pin-input' is forbidden. Use VerificationInput from 'react-verification-input';",
						},
						{
							name: 'utils/deprecatedHandleAxiosError',
							importNames: ['default'],
							message:
								"Importing 'deprecatedHandleAxiosError' from '../utils/ErrorHandler' is deprecated. Please use an alternative error handling function.",
						},
						{
							name: 'next/image',
							message: 'Please use alternative methods for importing images.',
						},
						{
							name: 'axios',
							importNames: ['default'],
							message: 'Use axiosInstance instead.',
						},
						{
							name: '@mesh-payments/fox-utils',
							importNames: ['useRouterService'],
							message:
								"Importing 'useRouterService' from '@mesh-payments/fox-utils' is not allowed. Use 'useRouter' from 'next/router' instead.",
						},
					],
				},
			],
		},
	},
	{
		files: ['**/sharedComponents/**', 'sharedComponents/*/**'],

		rules: {
			'no-restricted-imports': [
				'error',
				{
					patterns: [
						{
							group: ['@mui/*/*/*'],
							message:
								'Wrong import path. See https://mui.com/material-ui/guides/minimizing-bundle-size/?srsltid=AfmBOoouKHRzuwLsrZjHL8d1N1tEN0wQkuzqsvzZDdF1Z-MwhC449Hze',
						},
						{
							group: ['**/components/**', '**/features/**'],
						},
						{
							group: [
								'@material-ui/core/*',
								'@material-ui/lab/*',
								'@material-ui/pickers/*',
								'!@material-ui/core/styles',
								'!@material-ui/pickers/constants',
							],

							message:
								"Material UI components should be imported from package root:  '@material-ui/core' or '@material-ui/lab or '@material-ui/pickers'.",
						},
						{
							group: ['travelAgent/*', 'travelAgent/**'],
							message:
								'Travel agent code can be used only under route `/travel/agents`.',
						},
					],
					paths: [
						{
							name: '@mesh-payments/fox-design-system',
							importNames: ['Link'],
							message:
								'Dont use `Link` from `@mesh-payments/fox-design-system` for redirecting to other pages. Use `Link` instead.',
						},
						{
							name: 'utils/deprecatedHandleAxiosError',
							importNames: ['default'],
							message:
								"Importing 'deprecatedHandleAxiosError' from '../utils/ErrorHandler' is deprecated. Please use an alternative error handling function.",
						},
						{
							name: 'next/image',
							message: 'Please use alternative methods for importing images.',
						},
						{
							name: 'axios',
							importNames: ['default'],
							message: 'Use axiosInstance instead.',
						},
						{
							name: '@mesh-payments/fox-utils',
							importNames: ['useRouterService'],
							message:
								"Importing 'useRouterService' from '@mesh-payments/fox-utils' is not allowed. Use 'useRouter' from 'next/router' instead.",
						},
					],
				},
			],
		},
	},
];
