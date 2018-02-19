import Query from '../../utils/query'

export const ACTION_LOADPAGE = 'about/pageload';
export const ACTION_LOADLIST = 'about/pagelist';
export const ACTION_LOCCHANGE = 'about/locchange';

const actionLoadPage = (pageid, data) => ({
	type: ACTION_LOADPAGE,
	data,
	pageid
});
const actionLoadList = (list) => ({
	type: ACTION_LOADLIST,
	list
});
const actionLocationChanged = (loc) => ({
	type: ACTION_LOCCHANGE,
	loc,
	reqpageid: loc.pathname.split('/')[2]
});

export const actionLoadPageEmit = pageId => dispatch => {
	if (!pageId || pageId === '') {
		pageId = 'index';
	}

	return Query('/api/about/page/' + pageId).get((ans) => {
		dispatch(actionLoadPage(pageId, ans.data));
	});
};
export const actionLoadListEmit = () => dispatch => {
	return Query('/api/about/_list').get((ans) => {
		dispatch(actionLoadList(ans.list));
	});
};
export const actionLocationChangedEmit = (loc) => actionLocationChanged(loc);