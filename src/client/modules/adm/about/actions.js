import Query from '../../../utils/query'

export const ACTION_LOADLIST = 'adm/about/pagelist';

const actionLoadList = (list) => ({
	type: ACTION_LOADLIST,
	list
});

export const actionLoadListEmit = () => dispatch => {
	return Query('/api/about/getlist').get((ans) => {
		dispatch(actionLoadList(ans.list));
	});
};