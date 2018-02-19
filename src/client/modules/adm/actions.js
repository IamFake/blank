// import Query from '../../utils/query'

// export const ACTION_LOADPAGE = 'adm/pageload';
// export const ACTION_LOCCHANGE = 'adm/locchange';
//
// const actionLoadPage = (pageid, data) => ({
// 	type: ACTION_LOADPAGE,
// 	data,
// 	pageid
// });
// const actionLocationChanged = (loc) => ({
// 	type: ACTION_LOCCHANGE,
// 	loc,
// 	reqpageid: loc.pathname.split('/')[2]
// });
//
// export const actionLoadPageEmit = pageId => dispatch => {
// 	if (!pageId || pageId === '') {
// 		pageId = 'index';
// 	}
//
// 	console.info('ADMIN ACTION EMIT LOAD PAGE');
// 	return Query('/api/admin/' + pageId).json((ans) => {
// 		dispatch(actionLoadPage(pageId, ans.data));
// 	});
// };
// export const actionLocationChangedEmit = (loc) => actionLocationChanged(loc);
