import { LitElement, html, css, unsafeCSS, nothing } from 'lit';
import { consume } from '@lit/context';
import { customElement, query, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { format, intervalToDuration, formatDuration } from "date-fns";

import { AppContext } from '../utils/context.js';
import { hashToGradient } from '../utils/colors';
import { socialApps } from '../utils/content';
import { DOM, notify, natives } from '../utils/helpers.js';
import './global.js'

import PageStyles from  '../styles/page.css';

import '../components/w5-img'
import '../components/invite-item';

@customElement('profile-view')
export class ProfileView extends LitElement {

  @consume({context: AppContext, subscribe: true})
  context;

  static styles = [
    unsafeCSS(PageStyles),
    css`

      :host {
        --avatar-size: clamp(5em, 18vw, 9em);
        --avatar-border-size: clamp(0.2em, 1vw, 0.4em);
        --block-padding: calc(var(--avatar-size) * 0.2);
        display: flex;
        box-sizing: border-box;
        justify-content: center;
        flex-direction: column;
        max-width: 700px;
        margin: 0 auto;
        border-radius: 0.5em;
        background: var(--grey);
        box-shadow: var(--block-shadow);
        overflow: hidden;
        cursor: default;
      }

      form {
        max-width: 600px;
        margin: 0 auto;
      }

      sl-input, sl-textarea {
        margin: 0 0 1em;
      }

      sl-tab-panel {
        padding: 0.5em 1.5em;
      }

      #profile_card {
        position: relative;
        flex: 0;
        min-width: 250px;
        margin: 0 0 1.5em;
      }

      #hero {
        width: 100%;
        height: var(--avatar-size);
        background: var(--deterministic-background);
      }

      #hero::after {
        content: " ";
        position: absolute;
        bottom: 0;
        width: 100%;
        height: var(--avatar-border-size);
        background: rgba(0 0 0 / 0.5);
        z-index: 2;
      }

      #hero[src] {
        background: none;
      }

      #hero::part(fallback) {
        display: none;
      }

      #hero sl-icon-button {
        position: absolute;
        top: 1em;
        right: 1em;
        background: rgba(0 0 0 / 0.6);
        border-radius: 100%;
        cursor: pointer;
        z-index: 2;
      }

      #avatar_wrapper {
        margin: 0 0 0 var(--block-padding);
      }

      #avatar {
        --size: var(--avatar-size);
        margin: calc(var(--avatar-size) * -0.65) 0 0 0;
        background: var(--grey-lighter);
        outline: var(--avatar-border-size) solid rgb(0 0 0 / 15%);
        box-shadow: 0 1px 1px 0px rgba(0 0 0 / 0.6);
        border-radius: 6px;
        z-index: 2;
        cursor: pointer;
      }

      #profile_name {
        margin: 0 0 0.5em 0.1em;
      }

      #profile_name h2 {
        margin: 0.8em 0 0.2em;
        /* font-size: calc(var(--avatar-size) * 0.2); */
      }

      #profile_name small {
        color: #777;
      }

      #tabs {
        flex: 1;
      }

      #tabs::part(base) {
        width: 100%;
      }

      #tabs::part(tabs) {
        background: rgba(0 0 0 / 15%);
        border: solid 1px var(--track-color);
        border-left: none;
        border-right: none;
      }

      #tabs::part(active-tab-indicator) {
        bottom: -1px;
      }

      #profile_panel section {
        margin: 0 0 2em;
      }

      :host(:not([owner])) #profile_panel section:has([empty]) {
        display: none;
      }

      #profile_panel header {
        margin: 0 0 1em;
        border-bottom: 1px solid rgba(255 255 255 / 0.05);
      }

      #profile_panel header sl-icon {
        margin-top: -0.15em;
        color: #bbb;
      }

        #profile_social header sl-icon::part(svg) {
          margin-top: -0.1em;
          font-size: 1.3em;
        }

      #profile_panel h3 {
        margin: 0 auto 0.2em 0.5em;
        font-weight: normal;
      }

      #profile_panel [empty-text][empty] {
        text-align: center;
      }

      #profile_social .section-content sl-icon-button {
        font-size: 1.5em;
      }

      #profile_career header {
        margin: 0 0 1.5em;
      }

      .job-group:not(:last-child) {
        margin: 0 0 2em;
        padding: 0 0 1em;
        border-bottom: 1px solid rgba(255 255 255 / 0.05)
      }

      .job:not(:last-child) {
        margin: 0 0 1em;
      }

      .job img {
        box-sizing: border-box;
        width: 4em;
        padding: 0.2em;
        border: 1px solid rgba(255 255 255 / 0.25);
        border-radius: 6px;
      }

      .job > div:first-child {
        min-width: 4em;
        margin: 0 1em 0 0;
      }

      .job:not(:first-child) > div:first-child img {
        width: 2.6em;
      }

      .job:not(:last-child) > div:first-child::after {
        content: "";
        display: block;
        flex: 1;
        width: 3px;
        background: rgba(255 255 255 / 0.2);
        margin: 0.7em 0 0;
        border-radius: 3px;
      }

      .job > div:first-child sl-icon-button {
        margin: 0.6em 0 0;
      }

      .job strong {
        margin: 0 0 0.4em;
        font-weight: normal;
      }

      .job small {
        margin: 0 0 0.2em;
        color: rgba(255 255 255 / 0.6);
      }

      .job p {
        white-space: pre-wrap;
      }

      .label-on-left {
        --label-width: 5.5rem;
        --gap-width: 1rem;
      }

      .label-on-left + .label-on-left {
        margin-top: var(--sl-spacing-medium);
      }

      .label-on-left::part(form-control) {
        display: grid;
        grid: auto / var(--label-width) 1fr;
        gap: var(--sl-spacing-3x-small) var(--gap-width);
        align-items: center;
      }

      .label-on-left::part(form-control-label) {
        text-align: right;
      }

      .label-on-left::part(form-control-help-text) {
        grid-column-start: 2;
      }

    `
  ]

  @property({ type: String, reflect: true })
  did;

  @property({ type: Boolean, reflect: true })
  owner;

  @property({ type: String, reflect: true })
  panel = 'profile';

  @query('#hero', true)
  heroImage;

  @query('#tabs', true)
  tabs;

  @query('#profile_form', true)
  profileForm;

  @query('#job_modal', true)
  jobModal;

  @query('#job_form', true)
  jobForm;

  @query('#avatar_input', true)
  avatarInput;

  @query('#profile_edit_modal', true)
  profileEditModal;

  static properties = {
    job: {
      type: Object
    },
    socialData: {
      type: Object
    },
    avatarDataUri: {
      type: String
    }
  }

  socialRecord: any;
  careerRecord: any;
  avatarRecord: any;
  socialData: any;
  careerData: any;

  constructor() {
    super();
    this.socialData = {
      displayName: '',
      bio: '',
      apps: {}
    }
    this.careerData = {
      jobs: [],
      skills: [],
      education: []
    }
  }

  willUpdate(props) {
    if (props.has('panel')) {
      this?.tabs?.show?.(this.panel || 'profile');
    }
    if (props.has('did') && this.did) {
      this.loadProfile(this.did);
    }
  }

  async loadProfile(did){
    this.profileForm.toggleAttribute('loading', true);
    const profileDid = await this.context.profileReady;
    this.owner = did === profileDid;
    this.heroImage.style.setProperty('--deterministic-background', hashToGradient(did.split(':')[2]));
    if (this.owner) {
      this.socialRecord = this.context.social;
      this.avatarRecord = this.context.avatar;
      this.careerRecord = this.context.career;
    }
    else {
      const records = await Promise.all([
        datastore.getSocial({ from: did }),
        datastore.readAvatar({ from: did }),
        datastore.getCareer({ from: did }),
      ])
      this.socialRecord = records[0];
      this.avatarRecord = records[1];
      this.careerRecord = records[2];
    }
    this.socialData = this.socialRecord?.cache?.json || {
      displayName: '',
      bio: '',
      apps: {}
    };
    this.careerData = this.careerRecord?.cache?.json || {
      jobs: [],
      skills: [],
      education: []
    };
    console.log(this.careerData);
    this.avatarDataUri = this.avatarRecord?.cache?.uri;
    this.profileForm.removeAttribute('loading');
  }

  async handleFileChange(e){
    const profileDid = await this.context.profileReady;
    this.owner = this.did === profileDid;
    const file = this.avatarInput.files[0];
    if (this.owner) {
      this.avatarRecord = await this.context.instance.setAvatar(file);
      this.avatarDataUri = this.avatarRecord.cache.uri;
    }
    else {
      this.avatarRecord = await datastore.setAvatar(file, this.avatarRecord, this.did);
      this.avatarDataUri = this.avatarRecord.cache.uri;
    }
  }

  async saveSocialInfo(e){
    if (this.socialRecord) {
      const formData = new FormData(this.profileForm);
      for (const entry of formData.entries()) {
        natives.deepSet(this.socialData, entry[0], entry[1] || undefined);
      }
      try {
        const profileDid = await this.context.profileReady;
        if (this.did === profileDid) {
          const record = await this.context.instance.setSocial(this.socialData);
          var { status } = await record.send(this.did);
        }
        else {
          await this.socialRecord.update({ data: this.socialData });
          var { status } = await this.socialRecord.send(this.did)
        }
        notify.success('Your profile info was saved')
      }
      catch(e) {
        console.log(e)
        notify.error('There was a problem saving your profile info')
      }
    }
  }

  showJobModal(job){
    this.job = !job ? { id: natives.randomString(32) } : typeof job === 'string' ? this.careerData.jobs.find(item => item.id === job) : job;
    this.jobModal.show();
  }

  async saveJob(closeModal = false){
    if (this.careerRecord) {
      if (!this.jobForm.checkValidity()) {
        notify.error('You haven\'t filled out all the required fields');
        return;
      }
      const formData = new FormData(this.jobForm);
      for (const entry of formData.entries()) {
        natives.deepSet(this.job, entry[0], entry[1]?.trim ? entry[1].trim() : entry[1] || undefined);
      }
      console.log(this.job);
      try {
        if (!this.careerData.jobs.includes(this.job)) {
          this.careerData.jobs.push(this.job);
        }
        const profileDid = await this.context.profileReady;
        if (this.did === profileDid) {
          const record = await this.context.instance.setCareer(this.careerData);
          var { status } = await record.send(this.did);
        }
        else {
          await this.careerRecord.update({ data: this.careerData });
          var { status } = await this.careerRecord.send(this.did)
        }
        notify.success('Job info saved')
        if (closeModal) this.jobModal.hide();
      }
      catch(e) {
        console.log(e)
        notify.error('There was a problem saving this job info')
      }
    }
  }

  render(){

    const now = new Date();
    const sortedJobs = this?.careerData?.jobs?.reduce((obj, job) => {
      const employer = job?.employer?.trim().toLowerCase() || '';
      (obj[employer] = obj[employer] || []).push(job)
      return obj;
    }, {})

    return html`

      <section id="profile_card" flex="column fill">

        <w5-img id="hero" src="${ifDefined(this.avatarDataUri)}" @click="${e => e.currentTarget.lastElementChild.click()}">
          <sl-icon-button name="pencil" size="medium"></sl-icon-button>
          <input id="hero_input" type="file" accept="image/png, image/jpeg, image/gif" style="display: none"  @change="${this.handleFileChange}" />
        </w5-img>

        <div id="avatar_wrapper">
          <w5-img id="avatar" src="${ifDefined(this.avatarDataUri)}" fallback="${this.owner ? 'person-fill-add' : 'person-fill'}" @click="${e => e.currentTarget.lastElementChild.click()}">
            <input id="avatar_input" type="file" accept="image/png, image/jpeg, image/gif" style="display: none"  @change="${this.handleFileChange}" />
          </w5-img>
          <div id="profile_name">
            <h2>${this.socialData.displayName || 'Anon'}</h2>
            <small>${this.socialData.tagline || ''}</small>
          </div>
          <!-- <section id="profile_social">
          <div class="section-content" empty-text="Add social links" ?empty="${!Object.values(this.socialData.apps || {}).length}">
            ${Object.entries(this.socialData.apps).map(app => {
              const name = app[0];
              return app[1] ? html`<sl-icon-button name="${socialApps[name].icon || name}" target="_blank" href="${socialApps[name].profileUrl + app[1]}"></sl-icon-button>` : nothing;
            })}
          </div>
        </section>  -->
        </div>

      </section>

      <sl-tab-group id="tabs" flex="fill" @sl-tab-show="${e => this.panel = e.detail.name}">
        <sl-tab slot="nav" panel="profile" ?active="${this.panel === 'profile' || nothing}">Profile</sl-tab>
        <sl-tab slot="nav" panel="posts" ?active="${this.panel === 'posts' || nothing}">Posts</sl-tab>
        ${ !this.owner ? nothing : html`
          <sl-tab slot="nav" panel="notifications" ?active="${this.panel === 'notifications' || nothing}">Notifications</sl-tab>
        `}

        <sl-tab-panel id="profile_panel" name="profile" ?active="${this.panel === 'profile' || nothing}">
          <section id="profile_about">
            <header flex="center-y">
              <sl-icon name="person-vcard" size="small"></sl-icon>
              <h3>About</h3>
              <sl-icon-button name="pencil" variant="default" size="medium" @click="${ e => this.profileEditModal.show() }"></sl-icon-button>
            </header>
            <p class="section-content" empty-text="Tell people about yourself" ?empty="${!this.socialData.bio}">${this.socialData.bio || nothing}</p>
          </section>

          <section id="profile_social">
            <header flex="center-y">
              <sl-icon name="at" size="small"></sl-icon>
              <h3>Social</h3>
              <sl-icon-button name="pencil" variant="default" size="medium" @click="${ e => this.profileEditModal.show() }"></sl-icon-button>
            </header>
            <div class="section-content" empty-text="Add social links" ?empty="${!Object.values(this.socialData.apps || {}).length}">
              ${Object.entries(this.socialData.apps).map(app => {
                const name = app[0];
                return app[1] ? html`<sl-icon-button name="${socialApps[name].icon || name}" target="_blank" href="${socialApps[name].profileUrl + app[1]}"></sl-icon-button>` : nothing;
              })}
            </div>
          </section>  
        
          <section id="profile_career">
            <header flex="center-y">
              <sl-icon name="briefcase" size="small"></sl-icon>
              <h3>Career</h3>
              <sl-icon-button name="plus-lg" variant="default" size="medium" @click="${ e => this.showJobModal() }"></sl-icon-button>
            </header>
            <div class="section-content" empty-text="Where have you worked?" ?empty="${!this.careerData?.jobs?.length}">
              ${
                Object.keys(sortedJobs).map((employer, i) => {
                  const group = sortedJobs[employer];
                  group.sort((a, b) => {
                    return (b.end_date ? new Date(b.end_date) : now) - (a.end_date ? new Date(a.end_date) : now);
                  })
                  return html`<ul class="job-group" style="order: ${Math.round(((group[0].end_date ? new Date(group[0].end_date) : now).getTime() + group.length) / 86_400_000)}">${ 
                    group.map(job => {
                      
                      if (!job.id) job.id = natives.randomString(32)

                      const startDate = new Date(job.start_date);
                      const endDate = job.end_date ? new Date(job.end_date) : null;
                      const duration = formatDuration(
                        intervalToDuration({
                          start: startDate,
                          end: endDate || new Date()
                        }),
                        { format: ['years', 'months'] }
                      )

                      return job ? html`
                        <li class="job" flex>
                          <div flex="column center-x">
                            <img src="https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${job.url}&size=128"/>
                            <sl-icon-button name="pencil" variant="default" size="medium" @click="${ e => this.showJobModal(job.id) }"></sl-icon-button>
                          </div>
                          <div flex="column align-start">
                            <strong>${job?.title}</strong>
                            <small>${job?.employer}</small>
                            <small>${format(startDate, 'MMM yyy')} - ${endDate ? format(endDate, 'MMM yyy') : 'Present'} · ${duration}</small>
                            <p>${job?.description}</p>
                          </div>
                        </li>
                      ` : nothing
                    })
                  }</ul>`;
                })
              }
            </div>
          </section>  
        </sl-tab-panel>

        <sl-tab-panel name="posts" ?active="${this.panel === 'posts' || nothing}">
          
        </sl-tab-panel>

        ${ !this.owner ? nothing : html`
          <sl-tab-panel name="notifications" ?active="${this.panel === 'notifications' || nothing}">
            ${[].map(invite => {
              return invite.initialWrite ? nothing : html`<invite-item .invite="${invite}"></invite-item>`
            })}
          </sl-tab-panel>
        `}
      </sl-tab-group>

      <sl-dialog id="profile_edit_modal" class="page-dialog" label="Edit Profile" placement="start">
        <form id="profile_form" @sl-change="${e => this.saveSocialInfo(e)}" @submit="${e => e.preventDefault()}">

          <sl-input name="displayName" value="${this.socialData.displayName}" label="Display Name" help-text="A public name visible to everyone"></sl-input>
          <sl-input name="tagline" value="${this.socialData.tagline}" label="What you do" help-text="Your title or personal tagline" maxlength="80"></sl-input>
          <sl-textarea name="bio" value="${this.socialData.bio}" label="Bio" help-text="Tell people a little more about yourself" maxlength="280" rows="4" resize="none"></sl-textarea>

          <h3>Social Accounts</h3>
          <sl-input label="X (Twitter)" name="apps.x" value="${this.socialData.apps.x}" class="label-on-left"></sl-input>
          <sl-input label="Instagram" name="apps.instagram" value="${this.socialData.apps.instagram}" class="label-on-left"></sl-input>
          <sl-input label="Facebook" name="apps.facebook" value="${this.socialData.apps.facebook}" class="label-on-left"></sl-input>
          <sl-input label="GitHub" name="apps.github" value="${this.socialData.apps.github}" class="label-on-left"></sl-input>
          <sl-input label="LinkedIn" name="apps.linkedin" value="${this.socialData.apps.linkedin}" class="label-on-left"></sl-input>
          <sl-input label="Tidal" name="apps.tidal" value="${this.socialData.apps.tidal}" class="label-on-left"></sl-input>
          <sl-input label="Cash" name="apps.cash" value="${this.socialData.apps.cash}" class="label-on-left"></sl-input>
        
        </form>
        <sl-button slot="footer" variant="primary" @click="${ e => this.profileEditModal.hide() }">Submit</sl-button>
      </sl-dialog> 
      
      <sl-dialog id="job_modal" class="page-dialog dialog-deny-close" label="Edit Job" placement="start">
        <form id="job_form" @submit="${e => { e.preventDefault(); this.saveJob() }}">   
          <sl-input name="employer" required value="${this?.job?.employer}" label="Employer" help-text="What was the name of your employer?"></sl-input>
          <sl-input name="url" required value="${this?.job?.url}" label="Employer Website" pattern="https?://.+" help-text="Enter the URL of the company"></sl-input>
          <sl-input name="title" required value="${this?.job?.title}" label="Job Title" help-text="What was your job title?"></sl-input>
          <div flex="center-y gap-medium">
            <sl-input name="start_date" required value="${this?.job?.start_date}" type="date" label="Start date"></sl-input>
            <sl-input name="end_date" value="${this?.job?.end_date}" type="date" label="End date"></sl-input>
          </div>
          <sl-textarea name="description" required value="${this?.job?.description}" label="Job Description" help-text="What did you do there?" maxlength="280" rows="4"></sl-textarea>
        </form>
        <sl-button slot="footer" variant="danger" @click="${ e => this.jobModal.hide() }">Cancel</sl-button>
        <sl-button slot="footer" variant="primary" @click="${ e => this.saveJob(true) }">Save</sl-button>
      </sl-dialog> 
    `
  }

}
