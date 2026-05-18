#!/usr/bin/env node

const arg = process.argv[2];

if (!arg) {
	console.log('Usage: npm-publish-checker <package>[@version]');
	process.exit(1);
}

const [packageName, requestedVersion] = arg.split('@');

const reset = '\x1B[0m';
const green = '\x1B[32m';
const yellow = '\x1B[33m';
const red = '\x1B[31m';
const cyan = '\x1B[36m';
const bold = '\x1B[1m';
const dim = '\x1B[2m';

const checkVersion = async (packageName, requestedVersion) => {
	const target = requestedVersion
		? `${packageName}@${requestedVersion}`
		: packageName;
	console.log(`\n🔍 Checking ${bold}${target}${reset}…\n`);

	const timeCmd = '`npm view ' + packageName + ' time`';
	const versionsCmd = '`npm view ' + packageName + ' versions`';

	const url = `https://registry.npmjs.org/${packageName}`;

	try {
		const response = await fetch(url);
		if (!response.ok) {
			console.error(
				`${red}❌ Failed to fetch registry data: ${response.statusText}${reset}`,
			);
			return;
		}

		const data = await response.json();

		const timeObj = data.time;
		const versionsObj = data.versions;

		if (!timeObj || !versionsObj) {
			console.error(`${red}❌ Invalid registry data structure${reset}`);
			return;
		}

		const versionTimes = Object.keys(timeObj).filter(
			(key) => key !== 'created' && key !== 'modified',
		);

		if (versionTimes.length === 0) {
			console.log(`${yellow}⚠️  No versions found in ${timeCmd}${reset}`);
			return;
		}

		const latestInTime = versionTimes.reduce((a, b) => {
			return new Date(timeObj[a]) > new Date(timeObj[b]) ? a : b;
		});

		const versionKeys = Object.keys(versionsObj);
		const latestInVersions = versionKeys[versionKeys.length - 1];

		console.log(`📊 ${bold}Registry status:${reset}`);

		if (requestedVersion) {
			const inTime = versionTimes.includes(requestedVersion);
			const inVersions = versionKeys.includes(requestedVersion);

			const formatStatus = (present) =>
				present ? `${green}✅ yes` : `${red}❌ no`;
			console.log(
				`  Present in ${timeCmd}:     ${formatStatus(inTime)}${reset}`,
			);
			console.log(
				`  Present in ${versionsCmd}: ${formatStatus(inVersions)}${reset}\n`,
			);

			if (inTime && !inVersions) {
				console.log(
					`${yellow}⚠️  Flag: the version is in ${timeCmd} but missing from ${versionsCmd}.${reset}`,
				);
			} else if (!inTime && inVersions) {
				console.log(
					`${yellow}⚠️  Flag: the version is in ${versionsCmd} but missing from ${timeCmd}.${reset}`,
				);
			} else if (!inTime && !inVersions) {
				console.log(
					`${red}❌ Flag: ${packageName}@${latestInTime} is missing from ${timeCmd} and ${versionsCmd}.${reset}`,
				);
			} else {
				console.log(
					`${green}✅ ${packageName}@${latestInTime} is correctly published.${reset}`,
				);
			}

			console.log(
				`\n✨ Latest version in ${timeCmd} is: ${cyan}${latestInTime}${reset}`,
			);
		} else {
			console.log(`  Latest in ${timeCmd}:     ${cyan}${latestInTime}${reset}`);
			console.log(
				`  Latest in ${versionsCmd}: ${cyan}${latestInVersions}${reset}\n`,
			);

			if (latestInTime !== latestInVersions) {
				console.log(
					`${yellow}⚠️ The latest version in ${timeCmd} does not match the latest version in ${versionsCmd}.${reset}`,
				);
				console.log(
					`${dim}💡 This might indicate that the publish process is not fully completed or there is a replication lag.${reset}`,
				);
			} else {
				console.log(
					`${green}✅ ${packageName}@${latestInTime} was correctly published.${reset}`,
				);
			}
		}
	} catch (error) {
		console.error(`${red}❌ Error occurred: ${error.message}${reset}`);
	}
};

await checkVersion(packageName, requestedVersion);
