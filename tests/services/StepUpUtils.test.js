import StepUpUtils from '../../src/service/utils'
import SInfo from 'react-native-sensitive-info';
describe("test Utlis functions", () => {
    it('should generate correct salt', async () => {
        const expectedSalt = ':6£\Ù"pð¬'
        const salt = await StepUpUtils.getSalt();
        expect(SInfo.getItem).toBeCalledWith('key');
        expect(salt).toBe(expectedSalt)
    })
})