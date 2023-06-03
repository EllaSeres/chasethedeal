import path from 'path';

export default {
	root: path.resolve(__dirname, './src/client/'),
	build: {
		rollupOptions: {
			input: {
				'index.html': './src/client/index.html',
				'game.html': './src/client/game.html',
				'scoreboard.html': './src/client/scoreboard.html'
			}
		}
	}
}
