import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: '1ndlu6oy',
    dataset: 'production'
  },
  deployment: {
    // The studio hosted at chloegirten.sanity.studio: deploys update it instead of asking for a host.
    appId: 'vo5knmxpeh5xo2dhka59y9t8',
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
  },
})
