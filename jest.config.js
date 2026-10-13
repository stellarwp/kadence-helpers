module.exports = {
	testEnvironment: 'jsdom',
	testMatch: [ '**/__tests__/**/*.test.js' ],
	transform: {
		'^.+\\.jsx?$': 'babel-jest',
	},
};
