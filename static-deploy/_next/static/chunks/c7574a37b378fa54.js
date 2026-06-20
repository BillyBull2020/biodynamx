(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,33525,(e,t,a)=>{"use strict";Object.defineProperty(a,"__esModule",{value:!0}),Object.defineProperty(a,"warnOnce",{enumerable:!0,get:function(){return i}});let i=e=>{}},98183,(e,t,a)=>{"use strict";Object.defineProperty(a,"__esModule",{value:!0});var i={assign:function(){return l},searchParamsToUrlQuery:function(){return n},urlQueryToSearchParams:function(){return s}};for(var r in i)Object.defineProperty(a,r,{enumerable:!0,get:i[r]});function n(e){let t={};for(let[a,i]of e.entries()){let e=t[a];void 0===e?t[a]=i:Array.isArray(e)?e.push(i):t[a]=[e,i]}return t}function o(e){return"string"==typeof e?e:("number"!=typeof e||isNaN(e))&&"boolean"!=typeof e?"":String(e)}function s(e){let t=new URLSearchParams;for(let[a,i]of Object.entries(e))if(Array.isArray(i))for(let e of i)t.append(a,o(e));else t.set(a,o(i));return t}function l(e,...t){for(let a of t){for(let t of a.keys())e.delete(t);for(let[t,i]of a.entries())e.append(t,i)}return e}},95057,(e,t,a)=>{"use strict";Object.defineProperty(a,"__esModule",{value:!0});var i={formatUrl:function(){return s},formatWithValidation:function(){return d},urlObjectKeys:function(){return l}};for(var r in i)Object.defineProperty(a,r,{enumerable:!0,get:i[r]});let n=e.r(90809)._(e.r(98183)),o=/https?|ftp|gopher|file/;function s(e){let{auth:t,hostname:a}=e,i=e.protocol||"",r=e.pathname||"",s=e.hash||"",l=e.query||"",d=!1;t=t?encodeURIComponent(t).replace(/%3A/i,":")+"@":"",e.host?d=t+e.host:a&&(d=t+(~a.indexOf(":")?`[${a}]`:a),e.port&&(d+=":"+e.port)),l&&"object"==typeof l&&(l=String(n.urlQueryToSearchParams(l)));let c=e.search||l&&`?${l}`||"";return i&&!i.endsWith(":")&&(i+=":"),e.slashes||(!i||o.test(i))&&!1!==d?(d="//"+(d||""),r&&"/"!==r[0]&&(r="/"+r)):d||(d=""),s&&"#"!==s[0]&&(s="#"+s),c&&"?"!==c[0]&&(c="?"+c),r=r.replace(/[?#]/g,encodeURIComponent),c=c.replace("#","%23"),`${i}${d}${r}${c}${s}`}let l=["auth","hash","host","hostname","href","path","pathname","port","protocol","query","search","slashes"];function d(e){return s(e)}},18581,(e,t,a)=>{"use strict";Object.defineProperty(a,"__esModule",{value:!0}),Object.defineProperty(a,"useMergedRef",{enumerable:!0,get:function(){return r}});let i=e.r(71645);function r(e,t){let a=(0,i.useRef)(null),r=(0,i.useRef)(null);return(0,i.useCallback)(i=>{if(null===i){let e=a.current;e&&(a.current=null,e());let t=r.current;t&&(r.current=null,t())}else e&&(a.current=n(e,i)),t&&(r.current=n(t,i))},[e,t])}function n(e,t){if("function"!=typeof e)return e.current=t,()=>{e.current=null};{let a=e(t);return"function"==typeof a?a:()=>e(null)}}("function"==typeof a.default||"object"==typeof a.default&&null!==a.default)&&void 0===a.default.__esModule&&(Object.defineProperty(a.default,"__esModule",{value:!0}),Object.assign(a.default,a),t.exports=a.default)},18967,(e,t,a)=>{"use strict";Object.defineProperty(a,"__esModule",{value:!0});var i={DecodeError:function(){return h},MiddlewareNotFoundError:function(){return j},MissingStaticPage:function(){return y},NormalizeError:function(){return b},PageNotFoundError:function(){return v},SP:function(){return f},ST:function(){return x},WEB_VITALS:function(){return n},execOnce:function(){return o},getDisplayName:function(){return u},getLocationOrigin:function(){return d},getURL:function(){return c},isAbsoluteUrl:function(){return l},isResSent:function(){return p},loadGetInitialProps:function(){return g},normalizeRepeatedSlashes:function(){return m},stringifyError:function(){return N}};for(var r in i)Object.defineProperty(a,r,{enumerable:!0,get:i[r]});let n=["CLS","FCP","FID","INP","LCP","TTFB"];function o(e){let t,a=!1;return(...i)=>(a||(a=!0,t=e(...i)),t)}let s=/^[a-zA-Z][a-zA-Z\d+\-.]*?:/,l=e=>s.test(e);function d(){let{protocol:e,hostname:t,port:a}=window.location;return`${e}//${t}${a?":"+a:""}`}function c(){let{href:e}=window.location,t=d();return e.substring(t.length)}function u(e){return"string"==typeof e?e:e.displayName||e.name||"Unknown"}function p(e){return e.finished||e.headersSent}function m(e){let t=e.split("?");return t[0].replace(/\\/g,"/").replace(/\/\/+/g,"/")+(t[1]?`?${t.slice(1).join("?")}`:"")}async function g(e,t){let a=t.res||t.ctx&&t.ctx.res;if(!e.getInitialProps)return t.ctx&&t.Component?{pageProps:await g(t.Component,t.ctx)}:{};let i=await e.getInitialProps(t);if(a&&p(a))return i;if(!i)throw Object.defineProperty(Error(`"${u(e)}.getInitialProps()" should resolve to an object. But found "${i}" instead.`),"__NEXT_ERROR_CODE",{value:"E394",enumerable:!1,configurable:!0});return i}let f="u">typeof performance,x=f&&["mark","measure","getEntriesByName"].every(e=>"function"==typeof performance[e]);class h extends Error{}class b extends Error{}class v extends Error{constructor(e){super(),this.code="ENOENT",this.name="PageNotFoundError",this.message=`Cannot find module for page: ${e}`}}class y extends Error{constructor(e,t){super(),this.message=`Failed to load static file for page: ${e} ${t}`}}class j extends Error{constructor(){super(),this.code="ENOENT",this.message="Cannot find the middleware module"}}function N(e){return JSON.stringify({message:e.message,stack:e.stack})}},73668,(e,t,a)=>{"use strict";Object.defineProperty(a,"__esModule",{value:!0}),Object.defineProperty(a,"isLocalURL",{enumerable:!0,get:function(){return n}});let i=e.r(18967),r=e.r(52817);function n(e){if(!(0,i.isAbsoluteUrl)(e))return!0;try{let t=(0,i.getLocationOrigin)(),a=new URL(e,t);return a.origin===t&&(0,r.hasBasePath)(a.pathname)}catch(e){return!1}}},84508,(e,t,a)=>{"use strict";Object.defineProperty(a,"__esModule",{value:!0}),Object.defineProperty(a,"errorOnce",{enumerable:!0,get:function(){return i}});let i=e=>{}},22016,(e,t,a)=>{"use strict";Object.defineProperty(a,"__esModule",{value:!0});var i={default:function(){return h},useLinkStatus:function(){return v}};for(var r in i)Object.defineProperty(a,r,{enumerable:!0,get:i[r]});let n=e.r(90809),o=e.r(43476),s=n._(e.r(71645)),l=e.r(95057),d=e.r(8372),c=e.r(18581),u=e.r(18967),p=e.r(5550);e.r(33525);let m=e.r(91949),g=e.r(73668),f=e.r(9396);function x(e){return"string"==typeof e?e:(0,l.formatUrl)(e)}function h(t){var a;let i,r,n,[l,h]=(0,s.useOptimistic)(m.IDLE_LINK_STATUS),v=(0,s.useRef)(null),{href:y,as:j,children:N,prefetch:w=null,passHref:S,replace:k,shallow:C,scroll:E,onClick:A,onMouseEnter:O,onTouchStart:P,legacyBehavior:z=!1,onNavigate:T,ref:R,unstable_dynamicOnHover:I,..._}=t;i=N,z&&("string"==typeof i||"number"==typeof i)&&(i=(0,o.jsx)("a",{children:i}));let M=s.default.useContext(d.AppRouterContext),L=!1!==w,U=!1!==w?null===(a=w)||"auto"===a?f.FetchStrategy.PPR:f.FetchStrategy.Full:f.FetchStrategy.PPR,{href:G,as:F}=s.default.useMemo(()=>{let e=x(y);return{href:e,as:j?x(j):e}},[y,j]);if(z){if(i?.$$typeof===Symbol.for("react.lazy"))throw Object.defineProperty(Error("`<Link legacyBehavior>` received a direct child that is either a Server Component, or JSX that was loaded with React.lazy(). This is not supported. Either remove legacyBehavior, or make the direct child a Client Component that renders the Link's `<a>` tag."),"__NEXT_ERROR_CODE",{value:"E863",enumerable:!1,configurable:!0});r=s.default.Children.only(i)}let B=z?r&&"object"==typeof r&&r.ref:R,$=s.default.useCallback(e=>(null!==M&&(v.current=(0,m.mountLinkInstance)(e,G,M,U,L,h)),()=>{v.current&&((0,m.unmountLinkForCurrentNavigation)(v.current),v.current=null),(0,m.unmountPrefetchableInstance)(e)}),[L,G,M,U,h]),D={ref:(0,c.useMergedRef)($,B),onClick(t){z||"function"!=typeof A||A(t),z&&r.props&&"function"==typeof r.props.onClick&&r.props.onClick(t),!M||t.defaultPrevented||function(t,a,i,r,n,o,l){if("u">typeof window){let d,{nodeName:c}=t.currentTarget;if("A"===c.toUpperCase()&&((d=t.currentTarget.getAttribute("target"))&&"_self"!==d||t.metaKey||t.ctrlKey||t.shiftKey||t.altKey||t.nativeEvent&&2===t.nativeEvent.which)||t.currentTarget.hasAttribute("download"))return;if(!(0,g.isLocalURL)(a)){n&&(t.preventDefault(),location.replace(a));return}if(t.preventDefault(),l){let e=!1;if(l({preventDefault:()=>{e=!0}}),e)return}let{dispatchNavigateAction:u}=e.r(99781);s.default.startTransition(()=>{u(i||a,n?"replace":"push",o??!0,r.current)})}}(t,G,F,v,k,E,T)},onMouseEnter(e){z||"function"!=typeof O||O(e),z&&r.props&&"function"==typeof r.props.onMouseEnter&&r.props.onMouseEnter(e),M&&L&&(0,m.onNavigationIntent)(e.currentTarget,!0===I)},onTouchStart:function(e){z||"function"!=typeof P||P(e),z&&r.props&&"function"==typeof r.props.onTouchStart&&r.props.onTouchStart(e),M&&L&&(0,m.onNavigationIntent)(e.currentTarget,!0===I)}};return(0,u.isAbsoluteUrl)(F)?D.href=F:z&&!S&&("a"!==r.type||"href"in r.props)||(D.href=(0,p.addBasePath)(F)),n=z?s.default.cloneElement(r,D):(0,o.jsx)("a",{..._,...D,children:i}),(0,o.jsx)(b.Provider,{value:l,children:n})}e.r(84508);let b=(0,s.createContext)(m.IDLE_LINK_STATUS),v=()=>(0,s.useContext)(b);("function"==typeof a.default||"object"==typeof a.default&&null!==a.default)&&void 0===a.default.__esModule&&(Object.defineProperty(a.default,"__esModule",{value:!0}),Object.assign(a.default,a),t.exports=a.default)},7056,e=>{"use strict";var t=e.i(43476),a=e.i(71645);function i({isOpen:e,onClose:i,source:r,prefillData:n={}}){let[o,s]=(0,a.useState)({name:"",email:"",phone:"",businessType:""}),[l,d]=(0,a.useState)(!1),[c,u]=(0,a.useState)(!1),[p,m]=(0,a.useState)(""),g=(0,a.useCallback)(async()=>{if(!o.email.trim())return void m("Email is required");if(!/\S+@\S+\.\S+/.test(o.email))return void m("Please enter a valid email");d(!0),m("");try{if(!(await fetch("/api/leads",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:o.name.trim(),email:o.email.trim(),phone:o.phone.trim()||void 0,businessType:o.businessType.trim()||void 0,source:r,businessUrl:n.businessUrl,auditGrade:n.auditGrade,auditScore:n.auditScore,monthlyLeak:n.monthlyLeak,annualLeak:n.annualLeak})})).ok)throw Error("Failed to submit");u(!0)}catch{m("Something went wrong. Please try again.")}finally{d(!1)}},[o,r,n]);return e?(0,t.jsx)("div",{className:"modal-overlay",onClick:e=>{e.target===e.currentTarget&&i()},children:(0,t.jsx)("div",{className:"modal-content",children:c?(0,t.jsxs)("div",{className:"success-container",children:[(0,t.jsx)("div",{className:"success-icon",children:"✅"}),(0,t.jsx)("h3",{className:"success-title",children:"Success!"}),(0,t.jsx)("p",{className:"modal-desc success-desc",children:o.phone?"We'll reach out within minutes via text. Check your phone! 📱":"Check your email — your results are on the way. 📧"}),(0,t.jsx)("p",{className:"modal-desc success-note",children:"In the meantime, feel free to try our live AI conversation on the homepage."}),(0,t.jsx)("button",{className:"modal-submit success-close",onClick:i,children:"Close"})]}):(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)("div",{className:"modal-header",children:[(0,t.jsx)("div",{className:"modal-icon",children:"🚀"}),(0,t.jsx)("h3",{className:"modal-title",children:"audit"===r?"Get Your Full Report":"Get Started"}),(0,t.jsx)("p",{className:"modal-desc",children:"audit"===r?"Enter your details and we'll send your complete report + a personalized growth plan.":"Our team will reach out within minutes. Free diagnostic, zero obligation."})]}),(0,t.jsxs)("div",{className:"modal-form",children:[(0,t.jsx)("input",{type:"text",className:"modal-input",placeholder:"Your Name",value:o.name,onChange:e=>s(t=>({...t,name:e.target.value}))}),(0,t.jsx)("input",{type:"email",className:"modal-input",placeholder:"Email Address *",value:o.email,onChange:e=>s(t=>({...t,email:e.target.value})),required:!0}),(0,t.jsx)("input",{type:"tel",className:"modal-input",placeholder:"Phone Number (for SMS updates)",value:o.phone,onChange:e=>s(t=>({...t,phone:e.target.value}))}),(0,t.jsxs)("select",{className:`modal-input modal-select ${o.businessType?"has-value":""}`,value:o.businessType,onChange:e=>s(t=>({...t,businessType:e.target.value})),"aria-label":"Business type",children:[(0,t.jsx)("option",{value:"",children:"Select your business type"}),(0,t.jsx)("option",{value:"call_center",children:"Call Center"}),(0,t.jsx)("option",{value:"small_business",children:"Small Business"}),(0,t.jsx)("option",{value:"startup",children:"Startup"}),(0,t.jsx)("option",{value:"med_spa",children:"Med Spa"}),(0,t.jsx)("option",{value:"real_estate",children:"Real Estate"}),(0,t.jsx)("option",{value:"dental",children:"Dental / Healthcare"}),(0,t.jsx)("option",{value:"home_services",children:"Home Services"}),(0,t.jsx)("option",{value:"ecommerce",children:"E-Commerce"}),(0,t.jsx)("option",{value:"agency",children:"Marketing Agency"}),(0,t.jsx)("option",{value:"other",children:"Other"})]})]}),p&&(0,t.jsx)("div",{className:"modal-error",children:p}),(0,t.jsx)("button",{className:"modal-submit",onClick:g,disabled:l,children:l?"⏳ Saving...":"audit"===r?"Send My Report →":"Get Started Free →"}),(0,t.jsx)("div",{className:"modal-trust",children:"🔒 No spam. We value your privacy. Unsubscribe anytime."}),(0,t.jsx)("button",{className:"modal-close",onClick:i,children:"✕"})]})})}):null}e.s(["default",()=>i])},64113,e=>{"use strict";var t=e.i(43476),a=e.i(71645),i=e.i(22016),r=e.i(7056);function n(){let[e,i]=(0,a.useState)(""),[r,n]=(0,a.useState)(""),[o,s]=(0,a.useState)(!1);return o?(0,t.jsxs)("div",{className:"audit-email-capture audit-email-success",children:[(0,t.jsx)("div",{className:"audit-email-check",children:"✅"}),(0,t.jsx)("div",{className:"audit-email-success-title",children:"We'll Send Your Report!"}),(0,t.jsx)("p",{className:"audit-email-success-text",children:"Our AI will audit your site and email you the full report with revenue recovery recommendations. Check your inbox within 24 hours."})]}):(0,t.jsxs)("div",{className:"audit-email-capture",children:[(0,t.jsxs)("div",{className:"audit-email-divider",children:[(0,t.jsx)("span",{className:"audit-email-divider-line"}),(0,t.jsx)("span",{className:"audit-email-divider-text",children:"or"}),(0,t.jsx)("span",{className:"audit-email-divider-line"})]}),(0,t.jsx)("div",{className:"audit-email-title",children:"📧 Not ready to talk? Get your audit report by email."}),(0,t.jsx)("p",{className:"audit-email-desc",children:"Enter your website and email. We'll run the audit and send you the full report — no call required."}),(0,t.jsxs)("form",{onSubmit:t=>{t.preventDefault(),e&&r&&s(!0)},className:"audit-email-form",children:[(0,t.jsx)("input",{type:"text",placeholder:"yourcompany.com",value:r,onChange:e=>n(e.target.value),required:!0,className:"audit-email-input"}),(0,t.jsx)("input",{type:"email",placeholder:"you@company.com",value:e,onChange:e=>i(e.target.value),required:!0,className:"audit-email-input"}),(0,t.jsx)("button",{type:"submit",className:"audit-email-btn",children:"Send My Audit →"})]}),(0,t.jsx)("p",{className:"audit-email-privacy",children:"Free. No spam. We'll only email your report + one follow-up."})]})}let o={critical:{color:"#ff3b3b",bg:"rgba(255,59,59,0.08)",border:"rgba(255,59,59,0.2)",label:"CRITICAL",icon:"🔴"},warning:{color:"#ffa726",bg:"rgba(255,167,38,0.08)",border:"rgba(255,167,38,0.2)",label:"WARNING",icon:"🟡"},good:{color:"#00ff41",bg:"rgba(0,255,65,0.08)",border:"rgba(0,255,65,0.2)",label:"GOOD",icon:"🟢"}},s={SEO:"🔍",AEO:"🤖",GEO:"🌐",Website:"💻",GMB:"📍",CTA:"🎯","AI Readiness":"⚡","Missed Calls":"📞","Revenue Leak":"💰",Content:"📝"};function l(){var e;let[l,d]=(0,a.useState)(""),[c,u]=(0,a.useState)("idle"),[p,m]=(0,a.useState)(0),[g,f]=(0,a.useState)(""),[x,h]=(0,a.useState)(null),[b,v]=(0,a.useState)(""),y=(0,a.useCallback)(async()=>{if(!l.trim())return;v(""),h(null),u("scanning"),m(0);let e=["Resolving DNS...","Measuring site speed...","Analyzing mobile UX...","Scanning for tech debt...","Identifying competitors...","Estimating revenue leaks...","Calculating ROI potential...","Auditing Google Business Profile...","Checking social presence...","Scanning AEO/GEO readiness...","Testing lead response...","Running deep diagnostic...","Analyzing structured data...","Simulating lead leakage...","Scanning voicemail gaps...","Compiling raw data..."];for(let t=0;t<e.length;t++)f(e[t]),m(Math.floor((t+1)/e.length*50)),await new Promise(e=>setTimeout(e,300+200*Math.random()));try{f("Executing 16-probe audit...");let e=await fetch("/api/audit",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:l.trim()})});if(!e.ok)throw Error(`Audit probe failed: ${e.statusText}`);let t=await e.json();m(60),u("analyzing"),f("Sending to Gemini for AI analysis...");let a=["Gemini processing audit data...","Identifying critical revenue leaks...","Calculating competitor gaps...","Generating executive summary...","Formulating action plan..."];for(let e=0;e<a.length;e++)f(a[e]),m(60+Math.floor((e+1)/a.length*35)),await new Promise(e=>setTimeout(e,600+400*Math.random()));let i=await fetch("/api/audit/summarize",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({auditData:t})});if(!i.ok)throw Error(`AI analysis failed: ${i.statusText}`);let r=await i.json();m(100),f("Audit complete. Preparing report..."),h(r),u("capture")}catch(e){console.error("Audit error:",e),v(e instanceof Error?e.message:"Audit failed"),u("error")}},[l]);return(0,t.jsxs)("div",{className:"audit-page",children:[(0,t.jsx)(r.default,{isOpen:"capture"===c,onClose:()=>u("complete"),source:"audit",prefillData:{businessUrl:l,auditGrade:x?.grade,auditScore:x?.overallHealthScore,monthlyLeak:x?.revenueSummary.totalMonthlyLeak,annualLeak:x?.revenueSummary.totalAnnualLeak}}),(0,t.jsxs)("nav",{className:"audit-nav",children:[(0,t.jsxs)(i.default,{href:"/",className:"audit-logo",children:[(0,t.jsx)("div",{className:"audit-logo-mark",children:"B"}),(0,t.jsxs)("div",{children:[(0,t.jsx)("div",{className:"audit-brand",children:"BioDynamX"}),(0,t.jsx)("div",{className:"audit-sub-brand",children:"Business Audit Engine"})]})]}),(0,t.jsx)("div",{className:"audit-badge",children:"Powered by Google Gemini"})]}),"idle"===c&&(0,t.jsxs)("div",{className:"audit-hero",children:[(0,t.jsx)("h1",{className:"audit-title",children:"Free AI Business Audit"}),(0,t.jsx)("p",{className:"audit-subtitle",children:"Enter your website URL. Our AI runs 16 diagnostic probes and Gemini generates a comprehensive report — in 60 seconds."}),(0,t.jsxs)("div",{className:"audit-input-group",children:[(0,t.jsx)("input",{type:"text",className:"audit-input",placeholder:"yourcompany.com",value:l,onChange:e=>d(e.target.value),onKeyDown:e=>"Enter"===e.key&&y()}),(0,t.jsx)("button",{className:"audit-btn",onClick:y,children:"Run Audit"})]}),(0,t.jsx)("div",{className:"audit-probes-label",children:"16 PROBES: SEO · AEO · GEO · Website · GMB · CTA · AI · Calls · Revenue · Content"}),(0,t.jsxs)("div",{className:"audit-trust",children:[(0,t.jsx)("span",{children:"🔒 No login required"}),(0,t.jsx)("span",{children:"⚡ Results in ~60 seconds"}),(0,t.jsx)("span",{children:"🤖 Powered by Gemini 2.5"})]}),(0,t.jsx)(n,{})]}),("scanning"===c||"analyzing"===c)&&(0,t.jsxs)("div",{className:"audit-scanning",children:[(0,t.jsxs)("div",{className:"audit-scan-ring",children:[(0,t.jsxs)("svg",{viewBox:"0 0 120 120",className:"audit-ring-svg",children:[(0,t.jsx)("circle",{cx:"60",cy:"60",r:"54",className:"audit-ring-bg"}),(0,t.jsx)("circle",{cx:"60",cy:"60",r:"54",className:"audit-ring-progress",strokeDasharray:`${3.39*p} 339.292`})]}),(0,t.jsxs)("div",{className:"audit-ring-text",children:[p,"%"]})]}),(0,t.jsx)("div",{className:"audit-scan-phase",children:"scanning"===c?"SCANNING":"AI ANALYSIS"}),(0,t.jsx)("div",{className:"audit-scan-status",children:g}),(0,t.jsx)("div",{className:"audit-scan-url",children:l})]}),"error"===c&&(0,t.jsxs)("div",{className:"audit-error",children:[(0,t.jsx)("div",{className:"audit-error-icon",children:"⚠️"}),(0,t.jsx)("div",{className:"audit-error-text",children:b}),(0,t.jsx)("button",{className:"audit-btn",onClick:()=>u("idle"),children:"Try Again"})]}),"complete"===c&&x&&(0,t.jsxs)("div",{className:"audit-results",children:[(0,t.jsxs)("div",{className:"audit-grade-card",children:[(0,t.jsx)("div",{className:"audit-grade",style:{color:(e=x.grade).startsWith("A")?"#00ff41":e.startsWith("B")?"#4ade80":e.startsWith("C")?"#ffa726":e.startsWith("D")?"#ff6b35":"#ff3b3b"},children:x.grade}),(0,t.jsxs)("div",{className:"audit-score",children:[(0,t.jsx)("span",{className:"audit-score-num",children:x.overallHealthScore}),(0,t.jsx)("span",{className:"audit-score-label",children:"/100"})]}),(0,t.jsx)("h2",{className:"audit-headline",children:x.headline}),(0,t.jsx)("p",{className:"audit-exec-summary",children:x.executiveSummary})]}),(0,t.jsxs)("div",{className:"audit-revenue-strip",children:[(0,t.jsxs)("div",{className:"audit-rev-item",children:[(0,t.jsx)("div",{className:"audit-rev-label",children:"Monthly Leak"}),(0,t.jsx)("div",{className:"audit-rev-value critical",children:x.revenueSummary.totalMonthlyLeak})]}),(0,t.jsx)("div",{className:"audit-rev-divider"}),(0,t.jsxs)("div",{className:"audit-rev-item",children:[(0,t.jsx)("div",{className:"audit-rev-label",children:"Annual Loss"}),(0,t.jsx)("div",{className:"audit-rev-value warning",children:x.revenueSummary.totalAnnualLeak})]}),(0,t.jsx)("div",{className:"audit-rev-divider"}),(0,t.jsxs)("div",{className:"audit-rev-item",children:[(0,t.jsx)("div",{className:"audit-rev-label",children:"Recoverable with AI"}),(0,t.jsx)("div",{className:"audit-rev-value good",children:x.revenueSummary.recoverableWithAI})]}),(0,t.jsx)("div",{className:"audit-rev-divider"}),(0,t.jsxs)("div",{className:"audit-rev-item",children:[(0,t.jsx)("div",{className:"audit-rev-label",children:"ROI Projection"}),(0,t.jsx)("div",{className:"audit-rev-value good",children:x.revenueSummary.roiProjection})]})]}),(0,t.jsx)("h3",{className:"audit-section-title",children:"Critical Findings"}),(0,t.jsx)("div",{className:"audit-findings-grid",children:x.criticalFindings.map((e,a)=>{let i=o[e.severity]||o.warning,r=s[e.category]||"📋";return(0,t.jsxs)("div",{className:"audit-finding-card",style:{borderColor:i.border,background:i.bg},children:[(0,t.jsxs)("div",{className:"audit-finding-header",children:[(0,t.jsx)("span",{className:"audit-finding-icon",children:r}),(0,t.jsx)("span",{className:"audit-finding-category",children:e.category}),(0,t.jsxs)("span",{className:"audit-finding-badge",style:{color:i.color,borderColor:i.border},children:[i.icon," ",i.label]})]}),(0,t.jsx)("p",{className:"audit-finding-text",children:e.finding}),(0,t.jsxs)("div",{className:"audit-finding-meta",children:[(0,t.jsxs)("span",{className:"audit-finding-impact",style:{color:i.color},children:[e.monthlyImpact,"/mo"]}),(0,t.jsxs)("span",{className:"audit-finding-time",children:["⏱ ",e.timeToFix]})]}),(0,t.jsxs)("div",{className:"audit-finding-fix",children:[(0,t.jsx)("strong",{children:"Fix:"})," ",e.fix]})]},a)})}),(0,t.jsx)("h3",{className:"audit-section-title",children:"Priority Action Plan"}),(0,t.jsx)("div",{className:"audit-actions",children:x.top3Actions.map(e=>(0,t.jsxs)("div",{className:"audit-action-card",children:[(0,t.jsxs)("div",{className:"audit-action-num",children:["#",e.priority]}),(0,t.jsxs)("div",{className:"audit-action-content",children:[(0,t.jsx)("div",{className:"audit-action-label",children:e.action}),(0,t.jsxs)("div",{className:"audit-action-result",children:["→ ",e.expectedResult]}),(0,t.jsxs)("div",{className:"audit-action-urgency",children:["⚡ ",e.urgency]})]})]},e.priority))}),(0,t.jsxs)("div",{className:"audit-competitor-gap",children:[(0,t.jsx)("div",{className:"audit-comp-label",children:"COMPETITOR INTELLIGENCE"}),(0,t.jsx)("p",{className:"audit-comp-text",children:x.competitorGap})]}),(0,t.jsxs)("div",{className:"audit-cta-section",children:[(0,t.jsx)("p",{className:"audit-pitch",children:x.biodynamxPitch}),(0,t.jsx)(i.default,{href:"/",className:"audit-cta-btn",children:"Talk to Jenny & Mark — Fix Everything Now"}),(0,t.jsx)("div",{className:"audit-cta-sub",children:"60-second voice diagnostic · Zero cost · Guaranteed 5x ROI"})]}),(0,t.jsx)("button",{className:"audit-again-btn",onClick:()=>{u("idle"),h(null),d("")},children:"Run Another Audit"})]}),(0,t.jsxs)("footer",{className:"audit-footer",children:[(0,t.jsx)("span",{children:"© 2026 BioDynamX Engineering Group × AI Expert Solutions"}),(0,t.jsx)("span",{children:"Enterprise Grade · SOC 2 Ready · 99.9% Uptime"})]}),(0,t.jsx)("style",{children:`
                /* ═══ BASE ═══ */
                .audit-page {
                    min-height: 100vh;
                    background: #050505;
                    color: #fff;
                    font-family: 'Inter', -apple-system, sans-serif;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                /* ═══ NAV ═══ */
                .audit-nav {
                    width: 100%;
                    max-width: 1200px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px 32px;
                }
                .audit-logo {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    text-decoration: none;
                }
                .audit-logo-mark {
                    width: 32px; height: 32px;
                    background: linear-gradient(135deg, #00ff41, #00cc33);
                    border-radius: 8px;
                    display: flex; align-items: center; justify-content: center;
                    font-weight: 900; font-size: 14px; color: #000;
                }
                .audit-brand { font-size: 16px; font-weight: 700; color: #fff; }
                .audit-sub-brand { font-size: 10px; color: rgba(255,255,255,0.35); letter-spacing: 0.08em; text-transform: uppercase; }
                .audit-badge {
                    font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.4);
                    padding: 4px 10px; border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 100px; letter-spacing: 0.04em;
                }

                /* ═══ HERO ═══ */
                .audit-hero {
                    text-align: center;
                    padding: 80px 32px 60px;
                    max-width: 700px;
                    animation: fadeUp 0.8s ease-out;
                }
                .audit-title {
                    font-size: clamp(32px, 5vw, 52px);
                    font-weight: 800;
                    letter-spacing: -0.04em;
                    line-height: 1.1;
                    margin: 0 0 16px;
                    background: linear-gradient(135deg, #fff 0%, #00ff41 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                .audit-subtitle {
                    font-size: 16px; color: rgba(255,255,255,0.45);
                    line-height: 1.6; margin: 0 0 36px;
                }
                .audit-input-group {
                    display: flex; gap: 8px;
                    max-width: 500px; margin: 0 auto 16px;
                }
                .audit-input {
                    flex: 1; padding: 16px 20px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.12);
                    border-radius: 12px;
                    color: #fff; font-size: 16px;
                    font-family: inherit;
                    outline: none;
                    transition: border-color 0.3s;
                }
                .audit-input:focus {
                    border-color: #00ff41;
                    box-shadow: 0 0 20px rgba(0,255,65,0.1);
                }
                .audit-input::placeholder { color: rgba(255,255,255,0.75); opacity: 1; }
                .audit-btn {
                    padding: 16px 32px;
                    background: linear-gradient(135deg, #00ff41, #00cc33);
                    border: none; border-radius: 12px;
                    color: #000; font-size: 15px; font-weight: 700;
                    font-family: inherit; cursor: pointer;
                    transition: all 0.3s; white-space: nowrap;
                }
                .audit-btn:hover {
                    transform: scale(1.02);
                    box-shadow: 0 4px 30px rgba(0,255,65,0.3);
                }
                .audit-probes-label {
                    font-size: 10px; color: rgba(255,255,255,0.2);
                    letter-spacing: 0.06em; margin-bottom: 24px;
                }
                .audit-trust {
                    display: flex; gap: 20px; justify-content: center;
                    font-size: 12px; color: rgba(255,255,255,0.3);
                }

                /* ═══ SCANNING ═══ */
                .audit-scanning {
                    text-align: center;
                    padding: 100px 32px;
                    animation: fadeUp 0.5s ease-out;
                }
                .audit-scan-ring {
                    position: relative; width: 140px; height: 140px;
                    margin: 0 auto 24px;
                }
                .audit-ring-svg { width: 100%; height: 100%; transform: rotate(-90deg); }
                .audit-ring-bg {
                    fill: none; stroke: rgba(255,255,255,0.06); stroke-width: 6;
                }
                .audit-ring-progress {
                    fill: none; stroke: #00ff41; stroke-width: 6;
                    stroke-linecap: round;
                    transition: stroke-dasharray 0.4s ease;
                }
                .audit-ring-text {
                    position: absolute; inset: 0;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 28px; font-weight: 700; color: #00ff41;
                }
                .audit-scan-phase {
                    font-size: 11px; font-weight: 600; color: #00ff41;
                    letter-spacing: 0.12em; margin-bottom: 8px;
                }
                .audit-scan-status {
                    font-size: 15px; color: rgba(255,255,255,0.6);
                    margin-bottom: 6px; min-height: 22px;
                }
                .audit-scan-url {
                    font-size: 12px; color: rgba(255,255,255,0.2);
                    font-family: 'SF Mono', monospace;
                }

                /* ═══ ERROR ═══ */
                .audit-error {
                    text-align: center; padding: 100px 32px;
                    animation: fadeUp 0.5s ease-out;
                }
                .audit-error-icon { font-size: 48px; margin-bottom: 16px; }
                .audit-error-text {
                    font-size: 16px; color: #ff4444; margin-bottom: 24px;
                    max-width: 400px; margin-left: auto; margin-right: auto;
                }

                /* ═══ RESULTS ═══ */
                .audit-results {
                    width: 100%; max-width: 900px;
                    padding: 40px 32px 60px;
                    animation: fadeUp 0.8s ease-out;
                }

                /* Grade Card */
                .audit-grade-card {
                    text-align: center;
                    padding: 48px 32px;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 20px;
                    margin-bottom: 24px;
                }
                .audit-grade {
                    font-size: 72px; font-weight: 900;
                    letter-spacing: -0.04em; line-height: 1;
                }
                .audit-score { margin: 8px 0 20px; }
                .audit-score-num {
                    font-size: 28px; font-weight: 700; color: rgba(255,255,255,0.7);
                }
                .audit-score-label {
                    font-size: 16px; color: rgba(255,255,255,0.3);
                }
                .audit-headline {
                    font-size: 22px; font-weight: 700; color: #fff;
                    letter-spacing: -0.02em; margin: 0 0 12px;
                    line-height: 1.3;
                }
                .audit-exec-summary {
                    font-size: 14px; color: rgba(255,255,255,0.45);
                    line-height: 1.7; max-width: 600px; margin: 0 auto;
                }

                /* Revenue Strip */
                .audit-revenue-strip {
                    display: flex; align-items: center; justify-content: center;
                    gap: 24px; padding: 24px;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 14px;
                    margin-bottom: 40px;
                    flex-wrap: wrap;
                }
                .audit-rev-item { text-align: center; }
                .audit-rev-label {
                    font-size: 10px; color: rgba(255,255,255,0.3);
                    letter-spacing: 0.06em; text-transform: uppercase;
                    margin-bottom: 4px;
                }
                .audit-rev-value {
                    font-size: 20px; font-weight: 700;
                    letter-spacing: -0.02em;
                }
                .audit-rev-value.critical { color: #ff3b3b; }
                .audit-rev-value.warning { color: #ffa726; }
                .audit-rev-value.good { color: #00ff41; }
                .audit-rev-divider {
                    width: 1px; height: 36px;
                    background: rgba(255,255,255,0.08);
                }

                /* Section Title */
                .audit-section-title {
                    font-size: 16px; font-weight: 700; color: rgba(255,255,255,0.6);
                    letter-spacing: -0.01em; margin: 0 0 16px;
                }

                /* Findings Grid */
                .audit-findings-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 12px;
                    margin-bottom: 40px;
                }
                .audit-finding-card {
                    padding: 16px;
                    border: 1px solid;
                    border-radius: 12px;
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                .audit-finding-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 30px rgba(0,0,0,0.3);
                }
                .audit-finding-header {
                    display: flex; align-items: center; gap: 8px;
                    margin-bottom: 10px;
                }
                .audit-finding-icon { font-size: 18px; }
                .audit-finding-category {
                    font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.7);
                    flex: 1;
                }
                .audit-finding-badge {
                    font-size: 9px; font-weight: 700; letter-spacing: 0.08em;
                    padding: 2px 8px; border: 1px solid;
                    border-radius: 100px;
                }
                .audit-finding-text {
                    font-size: 13px; color: rgba(255,255,255,0.55);
                    line-height: 1.5; margin: 0 0 10px;
                }
                .audit-finding-meta {
                    display: flex; justify-content: space-between;
                    align-items: center; margin-bottom: 10px;
                }
                .audit-finding-impact { font-size: 14px; font-weight: 700; }
                .audit-finding-time {
                    font-size: 11px; color: rgba(255,255,255,0.3);
                }
                .audit-finding-fix {
                    font-size: 12px; color: rgba(255,255,255,0.4);
                    line-height: 1.5;
                    padding-top: 10px;
                    border-top: 1px solid rgba(255,255,255,0.06);
                }

                /* Actions */
                .audit-actions {
                    display: flex; flex-direction: column; gap: 10px;
                    margin-bottom: 32px;
                }
                .audit-action-card {
                    display: flex; align-items: flex-start; gap: 16px;
                    padding: 16px 20px;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 12px;
                }
                .audit-action-num {
                    font-size: 24px; font-weight: 800; color: #00ff41;
                    min-width: 36px;
                }
                .audit-action-content { flex: 1; }
                .audit-action-label {
                    font-size: 14px; font-weight: 600; color: #fff;
                    margin-bottom: 4px;
                }
                .audit-action-result {
                    font-size: 12px; color: rgba(255,255,255,0.45);
                    margin-bottom: 4px;
                }
                .audit-action-urgency {
                    font-size: 11px; color: #ffa726; font-weight: 600;
                }

                /* Competitor Gap */
                .audit-competitor-gap {
                    padding: 20px 24px;
                    background: rgba(255,167,38,0.04);
                    border: 1px solid rgba(255,167,38,0.12);
                    border-radius: 12px;
                    margin-bottom: 32px;
                }
                .audit-comp-label {
                    font-size: 9px; font-weight: 700; color: #ffa726;
                    letter-spacing: 0.1em; margin-bottom: 8px;
                }
                .audit-comp-text {
                    font-size: 14px; color: rgba(255,255,255,0.5);
                    line-height: 1.6; margin: 0;
                }

                /* CTA Section */
                .audit-cta-section {
                    text-align: center;
                    padding: 40px 24px;
                    background: linear-gradient(135deg, rgba(0,255,65,0.03) 0%, rgba(0,255,65,0.01) 100%);
                    border: 1px solid rgba(0,255,65,0.12);
                    border-radius: 20px;
                    margin-bottom: 24px;
                }
                .audit-pitch {
                    font-size: 14px; color: rgba(255,255,255,0.5);
                    line-height: 1.7; margin: 0 0 24px;
                    max-width: 600px; margin-left: auto; margin-right: auto;
                }
                .audit-cta-btn {
                    display: inline-block;
                    padding: 18px 48px;
                    background: linear-gradient(135deg, #00ff41, #00cc33);
                    border-radius: 14px;
                    color: #000; font-size: 16px; font-weight: 800;
                    text-decoration: none;
                    transition: all 0.3s;
                    box-shadow: 0 4px 40px rgba(0,255,65,0.3);
                }
                .audit-cta-btn:hover {
                    transform: scale(1.03);
                    box-shadow: 0 8px 60px rgba(0,255,65,0.4);
                }
                .audit-cta-sub {
                    font-size: 12px; color: rgba(255,255,255,0.25);
                    margin-top: 12px; letter-spacing: 0.03em;
                }

                /* Run Again */
                .audit-again-btn {
                    display: block; width: 100%;
                    padding: 14px;
                    background: transparent;
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 12px;
                    color: rgba(255,255,255,0.3);
                    font-size: 13px; font-weight: 600;
                    font-family: inherit; cursor: pointer;
                    transition: all 0.3s;
                }
                .audit-again-btn:hover {
                    border-color: rgba(255,255,255,0.2);
                    color: rgba(255,255,255,0.5);
                }

                /* Footer */
                .audit-footer {
                    width: 100%; max-width: 900px;
                    padding: 20px 32px;
                    display: flex; justify-content: space-between;
                    font-size: 9px; color: rgba(255,255,255,0.12);
                    letter-spacing: 0.04em;
                    margin-top: auto;
                }

                /* Animations */
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* ═══ EMAIL CAPTURE ═══ */
                .audit-email-capture {
                    margin-top: 32px;
                    max-width: 440px;
                    margin-left: auto;
                    margin-right: auto;
                    animation: fadeUp 0.6s ease-out 0.3s both;
                }
                .audit-email-divider {
                    display: flex; align-items: center; gap: 12px;
                    margin-bottom: 20px;
                }
                .audit-email-divider-line {
                    flex: 1; height: 1px; background: rgba(255,255,255,0.08);
                }
                .audit-email-divider-text {
                    font-size: 12px; color: rgba(255,255,255,0.2);
                    text-transform: uppercase; letter-spacing: 0.1em;
                }
                .audit-email-title {
                    font-size: 15px; font-weight: 700; color: rgba(255,255,255,0.8);
                    margin-bottom: 6px;
                }
                .audit-email-desc {
                    font-size: 13px; color: rgba(255,255,255,0.35);
                    margin: 0 0 16px; line-height: 1.5;
                }
                .audit-email-form {
                    display: flex; flex-direction: column; gap: 8px;
                }
                .audit-email-input {
                    padding: 12px 16px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 10px;
                    color: #fff; font-size: 14px;
                    font-family: inherit; outline: none;
                    transition: border-color 0.3s;
                }
                .audit-email-input:focus {
                    border-color: rgba(139,92,246,0.4);
                }
                .audit-email-input::placeholder { color: rgba(255,255,255,0.6); opacity: 1; }
                .audit-email-btn {
                    padding: 12px 24px;
                    background: linear-gradient(135deg, #8b5cf6, #3b82f6);
                    border: none; border-radius: 10px;
                    color: #fff; font-size: 14px; font-weight: 700;
                    font-family: inherit; cursor: pointer;
                    transition: all 0.3s;
                }
                .audit-email-btn:hover {
                    transform: scale(1.02);
                    box-shadow: 0 4px 24px rgba(139,92,246,0.3);
                }
                .audit-email-privacy {
                    font-size: 11px; color: rgba(255,255,255,0.15);
                    margin: 8px 0 0; text-align: center;
                }
                .audit-email-success {
                    text-align: center;
                    padding: 24px;
                    background: rgba(34,197,94,0.04);
                    border: 1px solid rgba(34,197,94,0.12);
                    border-radius: 14px;
                }
                .audit-email-check { font-size: 28px; margin-bottom: 8px; }
                .audit-email-success-title {
                    font-size: 16px; font-weight: 700; color: #22c55e;
                    margin-bottom: 4px;
                }
                .audit-email-success-text {
                    font-size: 13px; color: rgba(255,255,255,0.4);
                    margin: 0; line-height: 1.5;
                }

                /* Mobile */
                @media (max-width: 640px) {
                    .audit-input-group { flex-direction: column; }
                    .audit-trust { flex-direction: column; gap: 8px; }
                    .audit-revenue-strip { flex-direction: column; gap: 16px; }
                    .audit-rev-divider { width: 60px; height: 1px; }
                    .audit-footer { flex-direction: column; align-items: center; gap: 4px; }
                    .audit-findings-grid { grid-template-columns: 1fr; }
                }
            `})]})}e.s(["default",()=>l])}]);